import React from 'react';
import PageTransition from '../components/PageTransition';
import SEO from '../components/SEO';

const ContactPage = () => {
  return (
    <PageTransition>
      <SEO title="Contact" description="Get in touch with us." />
      <div className="container mx-auto px-4 py-8 text-white max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>
        <p className="text-lg text-center mb-8">
          For business inquiries or other questions, please use the form below.
        </p>
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <form>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
              <input type="text" id="name" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Your Name" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
              <input type="email" id="email" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="your.email@example.com" />
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
              <textarea id="message" rows="5" className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Your message..."></textarea>
            </div>
            <div className="text-center">
              <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContactPage;
