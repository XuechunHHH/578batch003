import React, { createContext, useContext, useState } from 'react';

interface MarketNavigationContextType {
  lastVisitedPath: string;
  setLastVisitedPath: (path: string) => void;
}

const MarketNavigationContext = createContext<MarketNavigationContextType | undefined>(undefined);

export const MarketNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastVisitedPath, setLastVisitedPath] = useState<string>('/');

  return (
    <MarketNavigationContext.Provider value={{ lastVisitedPath, setLastVisitedPath }}>
      {children}
    </MarketNavigationContext.Provider>
  );
};

export const useMarketNavigation = () => {
  const context = useContext(MarketNavigationContext);
  if (context === undefined) {
    throw new Error('useMarketNavigation must be used within a MarketNavigationProvider');
  }
  return context;
};