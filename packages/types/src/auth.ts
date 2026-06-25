import { User } from './user';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
