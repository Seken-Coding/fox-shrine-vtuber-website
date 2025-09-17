import React from 'react';
import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';

const GalleryPage = () => {
  return (
    <PageTransition>
      <SEO title="Gallery" description="A collection of fan art and official art." />
      <div className="container mx-auto px-4 py-8 text-white">
        <h1 className="text-4xl font-bold mb-4 text-center">Gallery</h1>
        <p className="text-lg text-center mb-8">
          Coming Soon! A space to showcase amazing art from the community.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Placeholder for gallery images */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg aspect-square shadow-lg animate-pulse">
              <div className="bg-gray-700 h-full w-full rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default GalleryPage;
