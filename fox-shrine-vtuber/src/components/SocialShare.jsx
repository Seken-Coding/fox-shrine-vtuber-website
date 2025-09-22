import { FaTwitter, FaFacebook, FaReddit, FaLink } from 'react-icons/fa';

const SocialShare = ({ url, title }) => {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://foxshrine.com');
  const shareTitle = title || 'Fox Shrine VTuber';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    alert('Link copied to clipboard!');
  };
  
  return (
    <div className="flex space-x-4">
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
        aria-label="Share on Twitter"
      >
        <FaTwitter size={18} />
      </a>
      
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={18} />
      </a>
      
      <a 
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors"
        aria-label="Share on Reddit"
      >
        <FaReddit size={18} />
      </a>
      
      <button
        onClick={copyToClipboard}
        className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
        aria-label="Copy link"
      >
        <FaLink size={18} />
      </button>
    </div>
  );
};

export default SocialShare;