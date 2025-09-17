import React from 'react';
import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';
import MerchShowcase from '../components/MerchShowcase';
import SocialShare from '../components/SocialShare';

const MerchPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="Merchandise" 
        description="Official Fox Shrine VTuber merchandise - support your favorite fox with quality merch!" 
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-cinzel text-4xl md:text-5xl text-center text-shrine-red mb-8">
            Fox Shrine Merchandise
          </h1>
          <p className="text-xl text-center mb-12 max-w-3xl mx-auto">
            Show your support and spread the fox shrine magic with our exclusive merchandise collection!
          </p>

          {/* Merch Showcase Section */}
          <section className="mb-16">
            <h2 className="section-title mb-12">Featured Items</h2>
            <MerchShowcase />
          </section>

          {/* Quality & Support Section */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="shrine-card p-8">
                <h3 className="font-cinzel text-xl text-shrine-red mb-4">
                  ✨ Quality Promise
                </h3>
                <p className="mb-4">
                  Every item in our collection is carefully selected for quality and comfort. 
                  We work with trusted suppliers to ensure you receive merchandise that lasts.
                </p>
                <ul className="space-y-2">
                  <li>• Premium materials and printing</li>
                  <li>• Comfortable fits for all body types</li>
                  <li>• Durable designs that won't fade</li>
                  <li>• Officially licensed artwork</li>
                </ul>
              </div>

              <div className="shrine-card p-8">
                <h3 className="font-cinzel text-xl text-shrine-red mb-4">
                  🦊 Support the Shrine
                </h3>
                <p className="mb-4">
                  Your merchandise purchases directly support the creation of more content and 
                  help maintain the magical world of Fox Shrine!
                </p>
                <ul className="space-y-2">
                  <li>• Funds new equipment for better streams</li>
                  <li>• Supports content creation</li>
                  <li>• Helps grow the Fox Shrine community</li>
                  <li>• Enables special events and collaborations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Shipping & Returns Section */}
          <section className="mb-16">
            <div className="shrine-card p-8">
              <h2 className="section-title mb-8">Shipping & Returns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="font-cinzel text-xl text-shrine-red mb-2">Fast Shipping</h3>
                  <p>
                    Orders processed within 1-2 business days. Free shipping on orders over $50!
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="font-cinzel text-xl text-shrine-red mb-2">Easy Returns</h3>
                  <p>
                    30-day return policy for unworn items. We want you to be completely satisfied!
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">🌍</div>
                  <h3 className="font-cinzel text-xl text-shrine-red mb-2">Worldwide</h3>
                  <p>
                    We ship to most countries worldwide. Bringing Fox Shrine magic everywhere!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Social Share Section */}
          <section className="shrine-card p-8 text-center">
            <h2 className="section-title text-center mb-6">Share Your Fox Style</h2>
            <p className="mb-8">
              Got Fox Shrine merch? Share your photos and tag us to be featured on our social media!
            </p>
            <SocialShare />
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchPage;
