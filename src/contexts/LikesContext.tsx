import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateUserLikes } from '../services/api';

interface LikesContextType {
  likes: string[];
  toggleLike: (cryptoId: string) => Promise<void>;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export const LikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.likes) {
      setLikes(user.likes);
    }
  }, [user]);

  const toggleLike = async (cryptoId: string) => {
    try {
      if (!user || user.id === 'guest') return;

      const newLikes = likes.includes(cryptoId)
        ? likes.filter(id => id !== cryptoId)
        : [...likes, cryptoId];

      const updatedLikes = await updateUserLikes(user.id, newLikes);
      setLikes(updatedLikes);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <LikesContext.Provider value={{ likes, toggleLike }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};