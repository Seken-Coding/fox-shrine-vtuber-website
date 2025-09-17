import React from 'react';
import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';
import LatestVideos from '../components/LatestVideos';
import SocialShare from '../components/SocialShare';

const ContentPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="Content & Videos" 
        description="Explore the magical world of Fox Shrine with our latest videos, streams, and community content!"
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-cinzel text-4xl md:text-5xl text-center text-shrine-red mb-8">
            Fox Shrine Content
          </h1>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            Dive into the mystical world of Fox Shrine! From epic gaming adventures to cozy chatting sessions, 
            discover all the magical content created just for you.
          </p>
          
          {/* Featured Stream Section */}
          <section className="mb-16">
            <div className="shrine-card p-8">
              <h2 className="section-title mb-8">Featured Stream</h2>
              <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="Featured Stream"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <p className="mt-4 text-center">
                Latest magical adventure from the shrine! Don't forget to like and subscribe for more content.
              </p>
            </div>
          </section>

          {/* Latest Videos Section */}
          <section className="mb-16">
            <h2 className="section-title mb-12">Latest Videos & Streams</h2>
            <LatestVideos />
          </section>

          {/* Content Categories */}
          <section className="mb-16 bg-shrine-white p-8 rounded-lg shadow-lg">
            <h2 className="section-title text-center mb-12">Content Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="font-cinzel text-xl mb-2 text-shrine-red">Gaming</h3>
                <p className="mb-4">
                  Epic gaming adventures across various titles - from indie gems to AAA blockbusters!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-shrine-red/20 text-shrine-red rounded-full text-sm">RPGs</span>
                  <span className="px-3 py-1 bg-fox-orange/20 text-fox-orange rounded-full text-sm">Indie</span>
                  <span className="px-3 py-1 bg-shrine-teal/20 text-shrine-teal rounded-full text-sm">Horror</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="font-cinzel text-xl mb-2 text-shrine-red">Chatting</h3>
                <p className="mb-4">
                  Cozy chat streams where we talk about life, answer questions, and share stories!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-shrine-red/20 text-shrine-red rounded-full text-sm">Q&A</span>
                  <span className="px-3 py-1 bg-fox-orange/20 text-fox-orange rounded-full text-sm">Stories</span>
                  <span className="px-3 py-1 bg-shrine-teal/20 text-shrine-teal rounded-full text-sm">Reviews</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-cinzel text-xl mb-2 text-shrine-red">Creative</h3>
                <p className="mb-4">
                  Art streams, singing, and other creative content straight from the fox's den!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-shrine-red/20 text-shrine-red rounded-full text-sm">Art</span>
                  <span className="px-3 py-1 bg-fox-orange/20 text-fox-orange rounded-full text-sm">Music</span>
                  <span className="px-3 py-1 bg-shrine-teal/20 text-shrine-teal rounded-full text-sm">Crafts</span>
                </div>
              </div>
            </div>
          </section>

          {/* Social Share Section */}
          <section className="shrine-card p-8 text-center">
            <h2 className="section-title text-center mb-6">Share the Magic</h2>
            <p className="mb-8">
              Love our content? Share it with friends and spread the fox shrine magic!
            </p>
            <SocialShare />
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContentPage;
