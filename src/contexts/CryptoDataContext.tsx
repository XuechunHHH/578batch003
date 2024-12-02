import React, { createContext, useContext, useState } from 'react';
import { CryptoData } from '../services/api';

interface CryptoDataContextType {
  cryptoList: CryptoData[];
  setCryptoList: (data: CryptoData[]) => void;
  getCryptoById: (id: string) => CryptoData | undefined;
}

const CryptoDataContext = createContext<CryptoDataContextType | undefined>(undefined);

export const CryptoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cryptoList, setCryptoList] = useState<CryptoData[]>([]);

  const getCryptoById = (id: string) => {
    return cryptoList.find(crypto => crypto.id === id);
  };

  return (
    <CryptoDataContext.Provider value={{ cryptoList, setCryptoList, getCryptoById }}>
      {children}
    </CryptoDataContext.Provider>
  );
};

export const useCryptoData = () => {
  const context = useContext(CryptoDataContext);
  if (context === undefined) {
    throw new Error('useCryptoData must be used within a CryptoDataProvider');
  }
  return context;
};