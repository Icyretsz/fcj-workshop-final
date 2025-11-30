export interface User {
  id: number;
  cognito_sub: string;
  username: string;
  email: string;
  role: string;
  phone_number: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DeleteResponse {
    message: string;
    user: User;
}

export interface GetUserInfoResponse extends ApiResponse<User> {}
export interface GetAllUsersInfoResponse extends ApiResponse<User[]> {}
export interface UpdateUserInfoResponse extends ApiResponse<User> {}
export interface DeleteUserResponse extends ApiResponse<DeleteResponse> {}
export interface CreateUserResponse extends ApiResponse<User> {}

