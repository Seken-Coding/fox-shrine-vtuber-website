import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogoPlaceholder } from './PlaceholderImages';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-shrine-white shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <LogoPlaceholder className="h-10" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/schedule">Schedule</NavLink>
            <NavLink to="/content">Content</NavLink>
            <NavLink to="/merch">Merch</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>
            <NavLink to="/connect">Connect</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-shrine-dark focus:outline-none"
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
        {isOpen && (
          <div className="md:hidden mt-4 py-4 bg-shrine-white rounded-lg shadow-lg">
            <div className="flex flex-col space-y-3 px-4">
              <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>About</MobileNavLink>
              <MobileNavLink to="/schedule" onClick={() => setIsOpen(false)}>Schedule</MobileNavLink>
              <MobileNavLink to="/content" onClick={() => setIsOpen(false)}>Content</MobileNavLink>
              <MobileNavLink to="/merch" onClick={() => setIsOpen(false)}>Merch</MobileNavLink>
              <MobileNavLink to="/gallery" onClick={() => setIsOpen(false)}>Gallery</MobileNavLink>
              <MobileNavLink to="/connect" onClick={() => setIsOpen(false)}>Connect</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="font-cinzel text-shrine-dark hover:text-shrine-red transition-colors relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-shrine-red transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    className="font-cinzel text-shrine-dark hover:text-shrine-red transition-colors py-2"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;