import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';
import SocialShare from '../components/SocialShare';
import { 
  AnimatedSection, 
  AnimatedContainer, 
  ShrineCard, 
  AnimatedPageHeader 
} from '../components/AnimationComponents';

const ContactPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="Connect" 
        description="Connect with Fox Shrine - join our community and get in touch!" 
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <AnimatedPageHeader 
            title="Connect with Fox Shrine"
            description="Join our magical community and stay connected! Whether you want to chat, collaborate, or just say hello - we'd love to hear from you."
          />

          {/* Social Media Section */}
          <AnimatedSection className="mb-16">
            <h2 className="section-title mb-12">Join Our Community</h2>
            <AnimatedContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ShrineCard index={0} className="p-8 text-center">
                <div className="text-5xl mb-4 text-shrine-red">💬</div>
                <h3 className="font-cinzel text-2xl text-shrine-red mb-4">Discord</h3>
                <p className="mb-6">
                  Join our Discord server for real-time chat, community events, and exclusive updates!
                </p>
                <button className="fox-button w-full">
                  Join Discord
                </button>
              </ShrineCard>

              <ShrineCard index={1} className="p-8 text-center">
                <div className="text-5xl mb-4 text-shrine-red">🐦</div>
                <h3 className="font-cinzel text-2xl text-shrine-red mb-4">Twitter</h3>
                <p className="mb-6">
                  Follow us for daily updates, stream announcements, and behind-the-scenes content!
                </p>
                <button className="fox-button w-full">
                  Follow on Twitter
                </button>
              </ShrineCard>

              <ShrineCard index={2} className="p-8 text-center">
                <div className="text-5xl mb-4 text-shrine-red">📺</div>
                <h3 className="font-cinzel text-2xl text-shrine-red mb-4">YouTube</h3>
                <p className="mb-6">
                  Subscribe for stream highlights, exclusive videos, and special announcements!
                </p>
                <button className="fox-button w-full">
                  Subscribe on YouTube
                </button>
              </ShrineCard>
            </AnimatedContainer>
          </AnimatedSection>

          {/* Contact Form Section */}
          <AnimatedSection className="mb-16 max-w-4xl mx-auto" delay={0.2}>
            <ShrineCard className="p-8">
              <h2 className="section-title mb-8">Send Us a Message</h2>
              <p className="text-center mb-8">
                Have a business inquiry, collaboration idea, or just want to say hello? 
                Drop us a message and we'll get back to you as soon as possible!
              </p>
            
            <form className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-shrine-red font-medium mb-2">
                    Name *
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-shrine-red focus:border-transparent transition-colors" 
                    placeholder="Your Name" 
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-shrine-red font-medium mb-2">
                    Email *
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-shrine-red focus:border-transparent transition-colors" 
                    placeholder="your.email@example.com" 
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-shrine-red font-medium mb-2">
                  Subject
                </label>
                <input 
                  type="text" 
                  id="subject" 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-shrine-red focus:border-transparent transition-colors" 
                  placeholder="What's this about?" 
                />
              </div>
              
              <div className="mb-8">
                <label htmlFor="message" className="block text-shrine-red font-medium mb-2">
                  Message *
                </label>
                <textarea 
                  id="message" 
                  rows="6" 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-shrine-red focus:border-transparent transition-colors resize-vertical" 
                  placeholder="Tell us your thoughts, ideas, or questions..."
                  required
                ></textarea>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit" 
                  className="fox-button px-8 py-3 text-lg"
                >
                  Send Message ✨
                </button>
                <p className="text-gray-400 text-sm mt-4">
                  We typically respond within 24-48 hours
                </p>
              </div>
            </form>
            </ShrineCard>
          </AnimatedSection>

          {/* Additional Ways to Connect */}
          <AnimatedSection delay={0.4}>
            <ShrineCard className="p-8 text-center">
              <h2 className="section-title text-center mb-6">More Ways to Connect</h2>
              <p className="mb-8">
                Share your Fox Shrine experiences and connect with fellow community members!
              </p>
              <SocialShare />
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <span className="px-4 py-2 bg-shrine-red/20 text-shrine-red rounded-full">#FoxShrine</span>
                <span className="px-4 py-2 bg-fox-orange/20 text-fox-orange rounded-full">#VTuber</span>
                <span className="px-4 py-2 bg-shrine-teal/20 text-shrine-teal rounded-full">#Community</span>
                <span className="px-4 py-2 bg-gray-600/20 text-gray-300 rounded-full">#MagicalMoments</span>
              </div>
            </ShrineCard>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContactPage;
