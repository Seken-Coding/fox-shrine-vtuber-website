import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogoPlaceholder } from './PlaceholderImages';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-shrine-white dark:bg-dark-card shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <LogoPlaceholder className="h-10" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/schedule">Schedule</NavLink>
              <NavLink to="/content">Content</NavLink>
              <NavLink to="/merch">Merch</NavLink>
              <NavLink to="/gallery">Gallery</NavLink>
              <NavLink to="/connect">Connect</NavLink>
            </div>
            
            {/* Theme Toggle */}
            <DarkModeToggle />
            
            {/* Authentication Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">
                        {user.displayName?.[0] || user.username?.[0] || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-shrine-dark dark:text-dark-text">
                      {user.displayName || user.username}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                  
                  {/* Admin Dashboard Link */}
                  {isAdmin() && (
                    <Link 
                      to="/admin" 
                      className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  
                  {/* Logout Button */}
                  <button 
                    onClick={logout}
                    className="text-sm text-shrine-dark dark:text-dark-text hover:text-shrine-red dark:hover:text-dark-shrine-red transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-sm text-shrine-dark dark:text-dark-text hover:text-shrine-red dark:hover:text-dark-shrine-red transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthModal(true);
                    }}
                    className="text-sm bg-shrine-red text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-shrine-dark dark:text-dark-text focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {!!isOpen && (
          <div className="md:hidden mt-4 py-4 bg-shrine-white dark:bg-dark-card rounded-lg shadow-lg">
            <div className="flex flex-col space-y-3 px-4">
              <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About</MobileNavLink>
              <MobileNavLink to="/schedule" onClick={() => setIsOpen(false)}>Schedule</MobileNavLink>
              <MobileNavLink to="/content" onClick={() => setIsOpen(false)}>Content</MobileNavLink>
              <MobileNavLink to="/merch" onClick={() => setIsOpen(false)}>Merch</MobileNavLink>
              <MobileNavLink to="/gallery" onClick={() => setIsOpen(false)}>Gallery</MobileNavLink>
              <MobileNavLink to="/connect" onClick={() => setIsOpen(false)}>Connect</MobileNavLink>
              
              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-dark-border pt-3 mt-3">
                <span className="text-sm text-shrine-dark dark:text-dark-text">Dark Mode</span>
                <DarkModeToggle />
              </div>
              
              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium text-sm">
                          {user.displayName?.[0] || user.username?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-shrine-dark">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-xs text-purple-600">{user.role}</p>
                      </div>
                    </div>
                    {!!isAdmin() && (
                      <MobileNavLink to="/admin" onClick={() => setIsOpen(false)}>
                        Admin Dashboard
                      </MobileNavLink>
                    )}
                    <button 
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 text-shrine-dark hover:text-shrine-red transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 text-shrine-dark hover:text-shrine-red transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full text-left py-2 bg-shrine-red text-white rounded px-3 hover:bg-opacity-90 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        mode={authMode} 
      />
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="font-cinzel text-shrine-dark dark:text-dark-text hover:text-shrine-red dark:hover:text-dark-shrine-red transition-colors relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-shrine-red dark:bg-dark-shrine-red transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    className="font-cinzel text-shrine-dark dark:text-dark-text hover:text-shrine-red dark:hover:text-dark-shrine-red transition-colors py-2"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;