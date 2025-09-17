import React from 'react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import SocialShare from '../components/SocialShare';

const AboutPage = () => {
  return (
    <PageTransition>
      <SEO 
        title="About Me" 
        description="Learn about Fox Shrine VTuber - my origin story, personality, and the magic behind the shrine!"
      />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="font-cinzel text-4xl md:text-5xl text-center text-shrine-red dark:text-dark-shrine-red mb-8">
            About The Fox Shrine
          </h1>
          
          {/* Character Story Section */}
          <section className="mb-16">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="w-full lg:w-1/2">
                <h2 className="section-title">My Origin Story</h2>
                <p className="mb-4 dark:text-dark-text-secondary">
                  Legend has it that I was once a regular fox who stumbled upon an abandoned shrine deep in the mystical forest. After years of guarding it and absorbing its magical energy, I gained the ability to take human form and connect with the human world!
                </p>
                <p className="mb-4 dark:text-dark-text-secondary">
                  Now I split my time between maintaining my shrine and streaming to my wonderful human friends. The shrine magic gives me special powers (mostly just the power to be extremely silly on camera), and I'm on a mission to spread joy and laughter!
                </p>
                <p className="dark:text-dark-text-secondary">
                  While I may look human during streams, don't be fooled! You might catch glimpses of my fox ears and tail when I get too excited or surprised. And yes, I still have a fondness for shiny things and mischief!
                </p>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="bg-shrine-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
                  <p className="text-center text-gray-500 dark:text-dark-text-secondary italic">Character image will be displayed here</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Personality Traits */}
          <section className="mb-16 bg-shrine-white dark:bg-dark-card p-8 rounded-lg shadow-lg">
            <h2 className="section-title text-center mb-12">Personality Traits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-fox-orange/20 rounded-full p-6 mb-4">
                  <svg className="w-12 h-12 text-fox-orange" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.507 13.941c-1.512 1.195-3.174 1.931-5.506 1.931-2.334 0-3.996-.736-5.508-1.931l-.492.493c1.127 1.72 3.2 3.566 6 3.566 2.8 0 4.872-1.846 6-3.566l-.494-.493zm-9.007-5.941c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5zm7 0c-.828 0-1.5.671-1.5 1.5s.672 1.5 1.5 1.5 1.5-.671 1.5-1.5-.672-1.5-1.5-1.5z" />
                  </svg>
                </div>
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">Playful & Mischievous</h3>
                <p className="dark:text-dark-text-secondary">Always ready with a joke or prank. Easily distracted by games and shiny objects!</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-shrine-red/20 rounded-full p-6 mb-4">
                  <svg className="w-12 h-12 text-shrine-red" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1.25 17c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25.56-1.25 1.25-1.25 1.25.56 1.25 1.25zm1.393-9.998c-.608-.616-1.515-.955-2.551-.955-2.18 0-3.59 1.55-3.59 3.95h2.011c0-1.486.829-2.013 1.538-2.013.634 0 1.307.421 1.364 1.226.062.847-.39 1.277-.962 1.821-1.412 1.343-1.438 1.993-1.432 3.468h2.005c-.013-.664.03-1.203.935-2.178.677-.73 1.519-1.638 1.536-3.022.011-.924-.284-1.719-.854-2.297z" />
                  </svg>
                </div>
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">Curious & Energetic</h3>
                <p className="dark:text-dark-text-secondary">Always exploring new games and asking questions. Bouncing with energy during streams!</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-shrine-teal/20 rounded-full p-6 mb-4">
                  <svg className="w-12 h-12 text-shrine-teal" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-.001 5.75c.69 0 1.251.56 1.251 1.25s-.561 1.25-1.251 1.25-1.249-.56-1.249-1.25.559-1.25 1.249-1.25zm2.001 12.25h-4v-1c.484-.179 1-.201 1-.735v-4.467c0-.534-.516-.618-1-.797v-1h3v6.265c0 .535.517.558 1 .735v.999z" />
                  </svg>
                </div>
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">Caring & Loyal</h3>
                <p className="dark:text-dark-text-secondary">Dedicated to my community and friends. Will always be there to cheer you up!</p>
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="section-title text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto">
              <div className="shrine-card mb-6">
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">What games do you play?</h3>
                <p className="dark:text-dark-text-secondary">I love a variety of games! From cozy games like Animal Crossing and Stardew Valley to action-adventures and occasional horror games (though they make my fox tail puff up in fear!). I'm always open to suggestions from my community!</p>
              </div>
              
              <div className="shrine-card mb-6">
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">Can I send you fan art?</h3>
                <p className="dark:text-dark-text-secondary">Absolutely! I love receiving fan art and showcase it regularly on stream and in my gallery. You can send it through my social media or post it with the tag #FoxShrineArt.</p>
              </div>
              
              <div className="shrine-card mb-6">
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">Do you do collaborations?</h3>
                <p className="dark:text-dark-text-secondary">Yes! I enjoy collaborating with other content creators. You can reach out through my business email for serious inquiries. I'm particularly fond of collaborating with other shrine or animal-themed VTubers!</p>
              </div>
              
              <div className="shrine-card">
                <h3 className="font-cinzel text-xl mb-2 dark:text-dark-text">What's your favorite food?</h3>
                <p className="dark:text-dark-text-secondary">Traditional shrine offerings like inarizushi (sweet tofu pouches) are my absolute favorite! I also have a weakness for strawberries and anything sweet. And yes, occasionally I might snack on chicken nuggets while no one is looking!</p>
              </div>
            </div>
          </section>
          
          <SocialShare title="About Fox Shrine VTuber" />
        </div>
      </div>
    </PageTransition>
  );
};

export default AboutPage;
