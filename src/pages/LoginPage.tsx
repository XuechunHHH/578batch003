import React from 'react';
import { Activity } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-cyber-darker flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Activity className="w-12 h-12 text-cyber-blue" />
        </div>
        <h1 className="text-4xl font-bold text-cyber-blue neon-text">
          CryptoBoard
        </h1>
        <p className="text-gray-400 mt-2">
          Your gateway to real-time crypto analytics
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Secure login powered by Supabase</p>
      </div>
    </div>
  );
};