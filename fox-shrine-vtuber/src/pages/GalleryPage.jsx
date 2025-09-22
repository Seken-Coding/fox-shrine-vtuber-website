import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';
import { PlaceholderImage } from '../components/PlaceholderImages';
import { 
  AnimatedSection, 
  AnimatedContainer, 
  ShrineCard, 
  AnimatedPageHeader,
  AnimatedCard
} from '../components/AnimationComponents';

const GalleryPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="Gallery" 
        description="Explore beautiful fan art and official artwork from the Fox Shrine community!" 
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <AnimatedPageHeader 
            title="Fox Shrine Gallery"
            description="Immerse yourself in the artistic world of Fox Shrine - featuring stunning fan creations and official artwork that brings our magical universe to life."
          />

          {/* Featured Gallery */}
          <AnimatedSection className="mb-16">
            <h2 className="section-title mb-12">Featured Artwork</h2>
            <AnimatedContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <AnimatedCard key={i} index={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-square">
                    <PlaceholderImage 
                      width={300} 
                      height={300} 
                      text={`Art ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-sm mb-1">Artwork {i + 1}</h3>
                        <p className="text-gray-300 text-xs">By Community Artist</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </AnimatedContainer>
          </AnimatedSection>

          {/* Art Categories */}
          <AnimatedSection className="mb-16" delay={0.2}>
            <h2 className="section-title mb-12">Art Categories</h2>
            <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ShrineCard index={0} className="p-6 text-center">
                <div className="text-4xl mb-4">🦊</div>
                <h3 className="font-cinzel text-xl text-shrine-red mb-2">Character Art</h3>
                <p className="text-sm">
                  Beautiful depictions of our beloved fox shrine maiden
                </p>
              </ShrineCard>
              
              <ShrineCard index={1} className="p-6 text-center">
                <div className="text-4xl mb-4">🏯</div>
                <h3 className="font-cinzel text-xl text-shrine-red mb-2">Shrine Scenes</h3>
                <p className="text-sm">
                  Magical shrine environments and mystical landscapes
                </p>
              </ShrineCard>
              
              <ShrineCard index={2} className="p-6 text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-cinzel text-xl text-shrine-red mb-2">Magic & Effects</h3>
                <p className="text-sm">
                  Stunning magical effects and enchanted moments
                </p>
              </ShrineCard>
              
              <ShrineCard index={3} className="p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="font-cinzel text-xl text-shrine-red mb-2">Community</h3>
                <p className="text-sm">
                  Collaborative works and community celebrations
                </p>
              </ShrineCard>
            </AnimatedContainer>
          </AnimatedSection>

          {/* Submission Guidelines */}
          <AnimatedSection delay={0.4}>
            <ShrineCard className="p-8">
              <h2 className="section-title mb-8">Submit Your Art</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-cinzel text-xl text-shrine-red mb-4">How to Submit</h3>
                  <ul className="space-y-2 mb-6">
                    <li>• Share your art on Twitter/X with #FoxShrineArt</li>
                    <li>• Tag us @FoxShrine in your post</li>
                    <li>• Original artwork only (no AI-generated content)</li>
                    <li>• Keep it family-friendly and respectful</li>
                    <li>• High resolution images preferred (300 DPI+)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-cinzel text-xl text-shrine-red mb-4">What We Love</h3>
                  <ul className="space-y-2 mb-6">
                    <li>• Creative interpretations of Fox Shrine</li>
                    <li>• Unique art styles and techniques</li>
                    <li>• Seasonal and holiday-themed artwork</li>
                    <li>• Collaborative community projects</li>
                    <li>• Behind-the-scenes process videos</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <p className="mb-4">
                  Featured artists get a special shoutout during streams and may receive exclusive Fox Shrine merch!
                </p>
                <div className="inline-flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-shrine-red/20 text-shrine-red rounded-full">#FoxShrineArt</span>
                  <span className="px-4 py-2 bg-fox-orange/20 text-fox-orange rounded-full">#ShrineArtist</span>
                  <span className="px-4 py-2 bg-shrine-teal/20 text-shrine-teal rounded-full">#MagicalArt</span>
                </div>
              </div>
            </ShrineCard>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  );
};

export default GalleryPage;
