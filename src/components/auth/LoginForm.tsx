import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail } from 'lucide-react';
import { login, signup } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  username: string;
  password: string;
  email?: string;
}

export const LoginForm = () => {
  const { setUser } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = isSignup
        ? await signup(formData)
        : await login(formData);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setUser({
      id: 'guest',
      username: 'Guest',
      created_at: new Date().toISOString()
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-cyber-dark rounded-lg border border-cyber-blue/20"
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-cyber-blue neon-text">
        {isSignup ? 'Create Account' : 'Welcome Back'}
      </h2>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-blue w-5 h-5" />
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-cyber-blue focus:shadow-neon-blue transition-all duration-300"
              required
            />
          </div>

          {isSignup && (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-blue w-5 h-5" />
              <input
                type="email"
                placeholder="Email (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-cyber-blue focus:shadow-neon-blue transition-all duration-300"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-blue w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-cyber-darker text-white border border-cyber-blue/20 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-cyber-blue focus:shadow-neon-blue transition-all duration-300"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 rounded-lg py-3 font-bold hover:shadow-neon-blue transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Login'}
        </button>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-cyber-blue hover:text-white transition-colors duration-200"
          >
            {isSignup ? 'Already have an account?' : 'Need an account?'}
          </button>

          <button
            type="button"
            onClick={handleGuestAccess}
            className="text-cyber-pink hover:text-white transition-colors duration-200"
          >
            Continue as Guest
          </button>
        </div>
      </form>
    </motion.div>
  );
};