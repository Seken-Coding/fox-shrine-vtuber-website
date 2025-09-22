import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-shrine-gold focus:ring-opacity-50 transition-colors duration-300"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      role="switch"
      aria-checked={isDarkMode}
    >
      {/* Toggle Track */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
        initial={false}
        animate={{
          backgroundColor: isDarkMode ? '#374151' : '#D1D5DB'
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Toggle Thumb */}
      <motion.div
        className="relative w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow-md flex items-center justify-center"
        initial={false}
        animate={{
          x: isDarkMode ? 16 : -16,
          backgroundColor: isDarkMode ? '#F3F4F6' : '#FFFFFF'
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
      >
        {/* Sun/Moon Icons */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            rotate: isDarkMode ? 180 : 0,
            scale: isDarkMode ? 0 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Sun Icon */}
          <svg
            className="w-3 h-3 text-shrine-gold"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            rotate: isDarkMode ? 0 : -180,
            scale: isDarkMode ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Moon Icon */}
          <svg
            className="w-3 h-3 text-slate-800"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Ripple Effect on Click */}
      <motion.div
        className="absolute inset-0 rounded-full bg-shrine-gold opacity-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0, 0.3, 0]
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut"
        }}
        style={{ pointerEvents: 'none' }}
      />
    </button>
  );
};

export default DarkModeToggle;
