export interface User {
  id: string;
  username: string;
  email?: string;
  likes: any[];
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  email?: string;
}