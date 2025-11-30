import { ApiResponse } from '../types';

/**
 * Provide auth token from your component:
 * const { user } = useAuth();
 * apiClient.getAll<User[]>("/users", user?.id_token);
 */

const API_BASE_URL =
    import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000';

interface RequestOptions {
    method: string;
    headers: Record<string, string>;
    body?: string;
}

const request = async <T>(
    endpoint: string,
    token?: string | null,
    options: Partial<RequestOptions> = {}
): Promise<ApiResponse<T>> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return data;
        }

        return data;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error occurred',
        };
    }
};

const getAll = async <T>(
    endpoint: string,
    token?: string | null
): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, token, { method: 'GET' });
};

const getUser = async <T>(
    endpoint: string,
    id: string,
    token?: string | null
): Promise<ApiResponse<T>> => {
    return request<T>(`${endpoint}/${id}`, token, { method: 'GET' });
};

const post = async <T>(
    endpoint: string,
    body: unknown,
    token?: string | null
): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, token, {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

const put = async <T>(
    endpoint: string,
    body: unknown,
    token?: string | null
): Promise<ApiResponse<T>> => {
    return request<T>(endpoint, token, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
};

const deleteUser = async <T>(
    endpoint: string,
    id: string,
    token?: string | null
): Promise<ApiResponse<T>> => {
    return request<T>(`${endpoint}/${id}`, token, {
        method: 'DELETE',
    });
};

export const apiClient = {
    getAll,
    getUser,
    post,
    put,
    deleteUser,
};
