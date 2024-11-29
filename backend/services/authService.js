import { getDatabaseClient } from '../utils/supabaseClient.js';
import { hashPassword, comparePasswords } from '../utils/passwordUtils.js';

export class AuthService {
  constructor() {
    this.initializeClient();
  }

  async initializeClient() {
    this.supabase = await getDatabaseClient();
  }

  async checkUsernameExists(username) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking username:', error);
        throw new Error('Database error while checking username');
      }

      return !!data;
    } catch (error) {
      console.error('Username check error:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const hashedPassword = await hashPassword(userData.password);
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword,
        likes: []
      };

      const { data, error } = await this.supabase
        .from('users')
        .insert([userWithHashedPassword])
        .select()
        .single();

      if (error) {
        console.error('User creation error:', error);
        throw new Error(error.message || 'Failed to create account');
      }

      return this.sanitizeUser(data);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  sanitizeUser(userData) {
    const { password, ...safeUser } = userData;
    return safeUser;
  }

  async login(username, password) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Login query error:', error);
        throw new Error('Authentication failed');
      }

      if (!data) {
        throw new Error('User not found');
      }

      const isPasswordValid = await comparePasswords(password, data.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      return this.sanitizeUser(data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(username, password, email) {
    try {
      const usernameExists = await this.checkUsernameExists(username);
      
      if (usernameExists) {
        throw new Error('Username already taken');
      }

      const userData = {
        username,
        password,
        email,
        likes: []
      };

      return await this.createUser(userData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async updateLikes(userId, likes) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ likes })
        .eq('id', userId)
        .select('likes')
        .single();

      if (error) {
        console.error('Update likes error:', error);
        throw new Error('Failed to update likes');
      }

      return data.likes;
    } catch (error) {
      console.error('Update likes error:', error);
      throw error;
    }
  }
}