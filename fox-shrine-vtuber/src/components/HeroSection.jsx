import { Link } from 'react-router-dom';
import { FoxCharacterPlaceholder } from './PlaceholderImages';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background with shrine gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-shrine-red via-fox-orange to-shrine-teal z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-shrine-red/70 to-fox-orange/40"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative pt-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 text-white">
            <h1 className="font-cinzel text-4xl md:text-6xl font-bold mb-4">
              Welcome to the Fox Shrine
            </h1>
            <p className="text-xl mb-8 max-w-lg">
              Join me on a magical journey filled with laughter, games, and shrine fox mischief!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/schedule" className="fox-button">
                <span>View Schedule</span>
              </Link>
              <a href="https://twitch.tv/" target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white font-medium py-2 px-6 rounded-full hover:bg-purple-700 transition-colors duration-300 shadow-md flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
                <span>Watch Live</span>
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <FoxCharacterPlaceholder className="max-w-md animate-float" />
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;