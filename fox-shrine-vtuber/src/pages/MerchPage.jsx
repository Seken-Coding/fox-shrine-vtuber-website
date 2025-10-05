import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';
import MerchShowcase from '../components/MerchShowcase';
import SocialShare from '../components/SocialShare';
import { 
  AnimatedSection, 
  AnimatedContainer, 
  ShrineCard, 
  AnimatedPageHeader 
} from '../components/AnimationComponents';

const MerchPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="Merchandise" 
        description="Official Mei merchandise - support your favorite fox with quality merch!" 
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <AnimatedPageHeader 
            title="Mei Merchandise"
            description="Show your support and spread the fox shrine magic with our exclusive merchandise collection!"
          />

          {/* Merch Showcase Section */}
          <AnimatedSection className="mb-16">
            <h2 className="section-title mb-12">Featured Items</h2>
            <MerchShowcase />
          </AnimatedSection>

          {/* Quality & Support Section */}
          <AnimatedSection className="mb-16" delay={0.2}>
            <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ShrineCard index={0} className="p-8">
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
              </ShrineCard>

              <ShrineCard index={1} className="p-8">
                <h3 className="font-cinzel text-xl text-shrine-red mb-4">
                  🦊 Support the Gremlin
                </h3>
                <p className="mb-4">
                  Your merchandise purchases directly support the creation of more content and 
                  helps feeding this cute Fox!
                </p>
                <ul className="space-y-2">
                  <li>• Funds new equipment for better streams</li>
                  <li>• Supports content creation</li>
                  <li>• Helps growing the community</li>
                  <li>• Enables special events and collaborations</li>
                </ul>
              </ShrineCard>
            </AnimatedContainer>
          </AnimatedSection>
          
          {/* Social Share Section */}
          <AnimatedSection delay={0.6}>
            <ShrineCard className="p-8 text-center">
              <h2 className="section-title text-center mb-6">Share Your Mei Drip</h2>
              <p className="mb-8">
                Got Mei merch? Share your photos and tag us to be featured on our social media!
              </p>
              <SocialShare />
            </ShrineCard>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  );
};

export default MerchPage;
