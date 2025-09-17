import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitch, FaYoutube, FaTwitter, FaDiscord, FaInstagram } from 'react-icons/fa';
import { LogoPlaceholder } from './PlaceholderImages';

const Footer = () => {
  return (
    <footer className="bg-shrine-dark dark:bg-gray-900 text-shrine-white dark:text-dark-text pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <LogoPlaceholder className="h-10" />
            </Link>
            <p className="mt-4 text-sm text-gray-300 dark:text-dark-text-secondary">
              Fun, silly adventures from your favorite shrine fox VTuber!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-cinzel text-lg mb-4 text-shrine-gold dark:text-dark-shrine-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">About</Link></li>
              <li><Link to="/schedule" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">Schedule</Link></li>
              <li><Link to="/merch" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">Merch</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-cinzel text-lg mb-4 text-shrine-gold dark:text-dark-shrine-gold">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">Contact</Link></li>
              <li><Link to="/terms" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 dark:text-dark-text-secondary hover:text-fox-orange dark:hover:text-dark-fox-orange transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="font-cinzel text-lg mb-4 text-shrine-gold dark:text-dark-shrine-gold">Connect</h3>
            <div className="flex space-x-4 mb-6">
              <a href="https://twitch.tv/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-purple-400 transition">
                <FaTwitch size={24} />
              </a>
              <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-red-500 transition">
                <FaYoutube size={24} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition">
                <FaTwitter size={24} />
              </a>
              <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-indigo-400 transition">
                <FaDiscord size={24} />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-pink-400 transition">
                <FaInstagram size={24} />
              </a>
            </div>
            
            <h4 className="font-cinzel text-sm mb-2 text-shrine-gold dark:text-dark-shrine-gold">Subscribe to Newsletter</h4>
            <form className="flex">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="px-3 py-2 rounded-l-md text-shrine-dark dark:text-dark-text bg-white dark:bg-dark-card border dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-fox-orange dark:focus:ring-dark-fox-orange flex-grow text-sm"
              />
              <button 
                type="submit" 
                className="bg-fox-orange dark:bg-dark-fox-orange px-3 py-2 rounded-r-md hover:bg-shrine-red dark:hover:bg-dark-shrine-red transition"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Copyright */}
        <div className="border-t border-gray-700 dark:border-dark-border mt-8 pt-6 text-center text-sm text-gray-400 dark:text-dark-text-secondary">
          <p>© {new Date().getFullYear()} Fox Shrine VTuber. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;