import React, { useState } from 'react';
import { Activity, TrendingUp, BarChart3, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-cyber-dark border-b border-cyber-blue/20 p-4 relative z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Activity className="w-8 h-8 text-cyber-blue" />
          <h1 className="text-2xl font-cyber font-bold text-cyber-blue">
            CryptoBoard
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavItem 
            to="/" 
            icon={<TrendingUp className="w-4 h-4" />} 
            text="Markets" 
            active={location.pathname === '/'} 
          />
          <NavItem 
            to="/analytics" 
            icon={<BarChart3 className="w-4 h-4" />} 
            text="Analytics" 
            active={location.pathname === '/analytics'} 
          />
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-cyber-blue hover:text-white transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-cyber-dark border-b border-cyber-blue/20"
          >
            <nav className="container mx-auto py-4 px-4 flex flex-col space-y-4">
              <MobileNavItem
                to="/"
                icon={<TrendingUp className="w-5 h-5" />}
                text="Markets"
                active={location.pathname === '/'}
                onClick={() => setIsMenuOpen(false)}
              />
              <MobileNavItem
                to="/analytics"
                icon={<BarChart3 className="w-5 h-5" />}
                text="Analytics"
                active={location.pathname === '/analytics'}
                onClick={() => setIsMenuOpen(false)}
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavItem = ({ to, icon, text, active }: { to: string; icon: React.ReactNode; text: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 transition-colors duration-200 ${
      active ? 'text-cyber-blue' : 'text-gray-400 hover:text-cyber-blue'
    }`}
  >
    {icon}
    <span className="font-cyber">{text}</span>
  </Link>
);

const MobileNavItem = ({ 
  to, 
  icon, 
  text, 
  active, 
  onClick 
}: { 
  to: string; 
  icon: React.ReactNode; 
  text: string; 
  active: boolean;
  onClick: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-cyber-blue/10 text-cyber-blue' 
        : 'text-gray-400 hover:bg-cyber-blue/5 hover:text-cyber-blue'
    }`}
  >
    {icon}
    <span className="font-cyber text-lg">{text}</span>
  </Link>
);