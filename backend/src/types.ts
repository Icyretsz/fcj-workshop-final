import { APIGatewayProxyEvent } from 'aws-lambda';

export interface User {
  id: number;
  cognitoSub: string;
  username: string;
  email: string;
  role: string;
  phoneNumber: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DbCredentials {
  host: string;
  port: number;
  dbname: string;
  username: string;
  password: string;
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

export interface GetUserInfoResponse {
  user: User;
}

export interface APIGatewayProxyEventWithBody<T> extends Omit<APIGatewayProxyEvent, 'body'> {
  body: T;
}

export interface CognitoUser {
  userSub: string;
  username: string;
}

export interface TokenPayload {
  sub: string;
  'cognito:username': string;
  email: string;
  exp: number;
  iat: number;
}
