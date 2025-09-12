// Placeholder images for development
export const PlaceholderImage = ({ width = 400, height = 300, text = "Image", className = "" }) => (
  <div 
    className={`flex items-center justify-center bg-gradient-to-br from-shrine-red to-fox-orange text-white font-bold ${className}`}
    style={{ width, height, minWidth: width, minHeight: height }}
  >
    {text}
  </div>
);

export const FoxCharacterPlaceholder = ({ className = "" }) => (
  <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-fox-orange to-shrine-red text-white p-8 rounded-lg ${className}`}>
    <div className="text-6xl mb-4">🦊</div>
    <div className="text-center">
      <h3 className="font-cinzel text-xl mb-2">Fox Character</h3>
      <p className="text-sm opacity-80">Artwork Coming Soon!</p>
    </div>
  </div>
);

export const LogoPlaceholder = ({ className = "" }) => (
  <div className={`flex items-center justify-center bg-shrine-red text-white font-cinzel font-bold text-lg px-4 py-2 rounded ${className}`}>
    🦊 Fox Shrine
  </div>
);
