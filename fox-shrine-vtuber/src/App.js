import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ConfigProvider } from './hooks/useConfigDatabase';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import SchedulePage from './pages/SchedulePage';
import ContentPage from './pages/ContentPage';
import MerchPage from './pages/MerchPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import ErrorBoundary from './components/ErrorBoundary';

// ProtectedRoute is now a component under components/ for easier testing

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ConfigProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-300">
                <Navbar />
                <main>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add other routes as pages are created */}
            <Route path="/about" element={<AboutPage />} />
            {/* Authentication & User Pages */}
            <Route path="/login" element={<LoginPage />} />
            {/* Admin Dashboard - Protected Route */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            {/* Development Only - Setup Page */}
            
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/merch" element={<MerchPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/connect" element={<ContactPage />} />
            
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
          </ErrorBoundary>
        </main>
                <Footer />
              </div>
            </Router>
          </ConfigProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;