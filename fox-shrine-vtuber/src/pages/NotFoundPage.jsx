import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

/**
 * A 404 Not Found page component.
 * Informs the user that the requested page could not be found.
 * @returns {JSX.Element} The rendered NotFoundPage component.
 */
const NotFoundPage = () => {
  return (
    <>
      <SEO
        title="404 - Page Not Found"
        description="The page you are looking for does not exist. Let's get you back to the shrine."
        keywords={['404', 'not found', 'error', 'fox shrine']}
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8">
          <h1 className="font-cinzel text-6xl text-shrine-red mb-4 animate-pulse">404</h1>
          <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
          <p className="text-gray-400 mb-8">Oops! It seems our mischievous fox has hidden this page away.</p>
          <Link to="/" className="fox-button inline-block">
            Return to the Shrine
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
