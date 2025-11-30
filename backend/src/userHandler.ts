// ------------------------------
// Imports
// ------------------------------
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Client } from "pg";
import * as process from "process";
import { User, ApiResponse } from "./types";

// ------------------------------
// Logging utilities
// ------------------------------
const log = (...args: any[]) => console.log("[INFO]", ...args);
const error = (...args: any[]) => console.error("[ERROR]", ...args);

// ------------------------------
// Environment Variables
// ------------------------------
const RDS_HOST = process.env["RDS_HOST"];
const DB_NAME = process.env["DB_NAME"];
const SECRET_NAME = process.env["SECRET_NAME"];
const REGION = process.env["REGION"] || "us-east-1";

// ------------------------------
// Secrets Manager
// ------------------------------
const secretsClient = new SecretsManagerClient({ region: REGION });

async function getSecret() {
    try {
        const response = await secretsClient.send(
            new GetSecretValueCommand({ SecretId: SECRET_NAME })
        );
        if (!response.SecretString) throw new Error("SecretString is empty");
        return JSON.parse(response.SecretString);
    } catch (err) {
        error("Failed to get secret:", err);
        throw err;
    }
}

// ------------------------------
// Connect to RDS PostgreSQL
// ------------------------------
async function connectToRds(): Promise<Client> {
    const secret = await getSecret();

    const client = new Client({
        host: RDS_HOST,
        user: secret.username,
        password: secret.password,
        database: DB_NAME,
        port: secret.port ?? 5432,
        connectionTimeoutMillis: 5000,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        log("Connected to RDS PostgreSQL successfully.");
        await initializeDatabase(client);
        return client;
    } catch (err) {
        error("RDS connection failed:", err);
        throw err;
    }
}

// ------------------------------
// Initialize DB + insert demo data
// ------------------------------
async function initializeDatabase(client: Client) {
    await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      cognito_sub VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL,
      phone_number VARCHAR(20)
    );
  `);

    const result = await client.query("SELECT COUNT(*) FROM users");
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
        log("Inserting demo users...");
        await client.query(`
      INSERT INTO users (cognito_sub, username, email, role, phone_number)
      VALUES 
      ('demo-sub-1', 'Alice', 'alice@example.com', 'admin', '1234567890'),
      ('demo-sub-2', 'Bob', 'bob@example.com', 'user', '0987654321');
    `);
        log("Demo users inserted.");
    }
}

// ------------------------------
// Helper: wrap ApiResponse into API Gateway response
// ------------------------------
function respond<T>(statusCode: number, payload: ApiResponse<T>) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    };
}

// ------------------------------
// CRUD Operations
// ------------------------------
async function createUser(body: any) {
    const client = await connectToRds();
    try {
        const { cognitoSub, username, email, role, phoneNumber } = JSON.parse(body);

        const result = await client.query<User>(
            `INSERT INTO users (cognito_sub, username, email, role, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [cognitoSub, username, email, role, phoneNumber]
        );

        return respond(201, { success: true, data: result.rows[0] });
    } catch (err: any) {
        return respond(400, { success: false, error: err.message });
    } finally {
        await client.end();
    }
}

async function getAllUsers() {
    const client = await connectToRds();
    try {
        const result = await client.query<User>("SELECT * FROM users ORDER BY id ASC");
        return respond(200, { success: true, data: result.rows });
    } finally {
        await client.end();
    }
}

async function getUser(id: string) {
    const client = await connectToRds();
    try {
        const result = await client.query<User>("SELECT * FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return respond(404, { success: false, error: "User not found" });
        }

        return respond(200, { success: true, data: result.rows[0] });
    } finally {
        await client.end();
    }
}

async function updateUser(id: string, body: any) {
    const client = await connectToRds();
    try {
        const { username, email, role, phoneNumber } = JSON.parse(body);

        const result = await client.query<User>(
            `UPDATE users
       SET username = $1, email = $2, role = $3, phone_number = $4
       WHERE id = $5
       RETURNING *`,
            [username, email, role, phoneNumber, id]
        );

        if (result.rows.length === 0) {
            return respond(404, { success: false, error: "User not found" });
        }

        return respond(200, { success: true, data: result.rows[0] });
    } finally {
        await client.end();
    }
}

async function deleteUser(id: string) {
    const client = await connectToRds();
    try {
        const result = await client.query<User>(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return respond(404, { success: false, error: "User not found" });
        }

        return respond(200, { success: true, data: { message: "User deleted", user: result.rows[0] } });
    } finally {
        await client.end();
    }
}

// ------------------------------
// Lambda Handler
// ------------------------------
export const handler = async (event: any) => {
    log("[users-handler] process start.");

    const method = event.httpMethod;
    const id = event.pathParameters?.id;

    try {
        switch (method) {
            case "POST":
                return createUser(event.body);

            case "GET":
                return id ? getUser(id) : getAllUsers();

            case "PUT":
                if (!id) return respond(400, { success: false, error: "Missing user ID" });
                return updateUser(id, event.body);

            case "DELETE":
                if (!id) return respond(400, { success: false, error: "Missing user ID" });
                return deleteUser(id);

            default:
                return respond(400, { success: false, error: "Unsupported HTTP method" });
        }
    } catch (err: any) {
        return respond(500, { success: false, error: err.message });
    } finally {
        log("[users-handler] process end.");
    }
};
