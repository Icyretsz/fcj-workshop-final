# Cognito Auth Demo

A demonstration application implementing authentication and authorization using AWS Cognito, with a React frontend and AWS Lambda backend.

## Project Structure

```
/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components (to be added)
│   │   ├── pages/           # Page components (to be added)
│   │   ├── services/        # API service layer (to be added)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main App component
│   │   └── main.tsx         # Application entry point
│   ├── package.json
│   ├── tsconfig.json        # Strict TypeScript configuration
│   └── vite.config.ts       # Vite build configuration
├── backend/                  # Lambda functions
│   ├── src/
│   │   ├── handlers/        # Lambda function handlers (to be added)
│   │   ├── services/        # Business logic services (to be added)
│   │   ├── db/              # Database utilities (to be added)
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Shared utilities (to be added)
│   ├── package.json
│   └── tsconfig.json        # Strict TypeScript configuration
├── infrastructure/           # AWS infrastructure
│   └── db-migrations/       # Database migration scripts (to be added)
└── package.json             # Root package.json for monorepo
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS Account with Cognito, RDS, and Lambda configured

### Installation

Install dependencies for all workspaces:

```bash
npm install
```

### Development

Run the frontend development server:

```bash
npm run frontend
```

Build the backend Lambda functions:

```bash
npm run backend
```

Build all workspaces:

```bash
npm run build
```

## TypeScript Configuration

Both frontend and backend are configured with strict TypeScript settings:
- No implicit any types
- Strict null checks
- Strict function types
- No unused locals or parameters
- No implicit returns

All code must be fully typed with explicit interfaces and types.
