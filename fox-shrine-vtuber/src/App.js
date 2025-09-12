import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ScrollToTop from './components/ScrollToTop';

// Import other pages as they're created
// import SchedulePage from './pages/SchedulePage';
// import ContentPage from './pages/ContentPage';
// import MerchPage from './pages/MerchPage';
// import GalleryPage from './pages/GalleryPage';
// import ConnectPage from './pages/ConnectPage';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add other routes as pages are created */}
            <Route path="/about" element={<AboutPage />} />
          {/* <Route path="/schedule" element={<SchedulePage />} /> */}
          {/* <Route path="/content" element={<ContentPage />} /> */}
          {/* <Route path="/merch" element={<MerchPage />} /> */}
          {/* <Route path="/gallery" element={<GalleryPage />} /> */}
          {/* <Route path="/connect" element={<ConnectPage />} /> */}
          
          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="font-cinzel text-4xl text-shrine-red mb-4">Page Not Found</h1>
                <p className="mb-8">Oops! Looks like our fox has hidden this page!</p>
                <a href="/" className="fox-button">Return to Shrine</a>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </Router>
    </HelmetProvider>
  );
}

export default App;