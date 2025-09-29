const LoadingFallback = ({ fullscreen = true }) => (
  <div className={`flex justify-center items-center ${fullscreen ? 'h-screen' : 'py-16'}`}>
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-shrine-red" aria-label="Loading" role="status"></div>
  </div>
);

export default LoadingFallback;
