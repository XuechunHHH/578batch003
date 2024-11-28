import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { LoginCredentials, SignupCredentials, User } from '../types/auth';
import { AUTH_STORAGE_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = async ({ username, password }: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post('/auth/login', { username, password });
    const user = response.data;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Authentication failed');
    }
    throw new Error('Failed to connect to authentication service');
  }
};

export const signup = async ({ username, password, email }: SignupCredentials): Promise<User> => {
  try {
    const response = await api.post('/auth/signup', { username, password, email });
    const user = response.data;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to create account');
    }
    throw new Error('Failed to connect to authentication service');
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getUser = async (): Promise<User | null> => {
  const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
};