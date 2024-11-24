import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CryptoDetail } from './components/CryptoDetail';
import { Analytics } from './components/Analytics';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cyber-darker text-white font-cyber">
        <Header />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crypto/:id" element={<CryptoDetail />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;