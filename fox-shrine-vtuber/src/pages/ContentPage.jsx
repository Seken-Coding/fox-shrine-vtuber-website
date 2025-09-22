import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';
import LatestVideos from '../components/LatestVideos';
import SocialShare from '../components/SocialShare';
import { 
  AnimatedSection, 
  AnimatedContainer, 
  ShrineCard, 
  AnimatedPageHeader 
} from '../components/AnimationComponents';

const ContentPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="Content & Videos" 
        description="Explore the magical world of Fox Shrine with our latest videos, streams, and community content!"
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <AnimatedPageHeader 
            title="Fox Shrine Content"
            description="Dive into the mystical world of Fox Shrine! From epic gaming adventures to cozy chatting sessions, discover all the magical content created just for you."
          />
          
          {/* Featured Stream Section */}
          <AnimatedSection className="mb-16">
            <ShrineCard className="p-8">
              <h2 className="section-title mb-8">Featured Stream</h2>
              <div className="aspect-video bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden">
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
              <p className="mt-4 text-center dark:text-dark-text-secondary">
                Latest magical adventure from the shrine! Don't forget to like and subscribe for more content.
              </p>
            </ShrineCard>
          </AnimatedSection>

          {/* Latest Videos Section */}
          <AnimatedSection className="mb-16" delay={0.2}>
            <h2 className="section-title mb-12">Latest Videos & Streams</h2>
            <LatestVideos />
          </AnimatedSection>

          {/* Content Categories */}
          <AnimatedSection className="mb-16 bg-shrine-white dark:bg-dark-card p-8 rounded-lg shadow-lg" delay={0.4}>
            <h2 className="section-title text-center mb-12">Content Categories</h2>
            <AnimatedContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ShrineCard index={0} className="flex flex-col items-center text-center p-6 bg-white dark:bg-dark-card rounded-lg">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="font-cinzel text-xl mb-2 text-shrine-red dark:text-dark-shrine-red">Gaming</h3>
                <p className="mb-4 dark:text-dark-text-secondary">
                  Epic gaming adventures across various titles - from indie gems to AAA blockbusters!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-shrine-red/20 text-shrine-red rounded-full text-sm">RPGs</span>
                  <span className="px-3 py-1 bg-fox-orange/20 text-fox-orange rounded-full text-sm">Indie</span>
                  <span className="px-3 py-1 bg-shrine-teal/20 text-shrine-teal rounded-full text-sm">Horror</span>
                </div>
              </ShrineCard>

              <ShrineCard index={1} className="flex flex-col items-center text-center p-6 bg-white rounded-lg">
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
              </ShrineCard>

              <ShrineCard index={2} className="flex flex-col items-center text-center p-6 bg-white rounded-lg">
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
              </ShrineCard>
            </AnimatedContainer>
          </AnimatedSection>

          {/* Social Share Section */}
          <AnimatedSection delay={0.6}>
            <ShrineCard className="p-8 text-center">
              <h2 className="section-title text-center mb-6">Share the Magic</h2>
              <p className="mb-8">
                Love our content? Share it with friends and spread the fox shrine magic!
              </p>
              <SocialShare />
            </ShrineCard>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContentPage;
