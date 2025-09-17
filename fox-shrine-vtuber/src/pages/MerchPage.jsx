import React from 'react';
import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';

const MerchPage = () => {
  return (
    <PageTransition>
      <SEO title="Merchandise" description="Check out the latest merchandise from our VTuber!" />
      <div className="container mx-auto px-4 py-8 text-white">
        <h1 className="text-4xl font-bold mb-4 text-center">Merchandise</h1>
        <p className="text-lg text-center mb-8">
          Coming Soon! Check back later for awesome merch.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for merch items */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
              <div className="bg-gray-700 h-48 w-full rounded mb-4"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchPage;
