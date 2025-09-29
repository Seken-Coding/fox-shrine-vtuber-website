import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './hooks/useConfigDatabase';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const MerchPage = lazy(() => import('./pages/MerchPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ProtectedRoute is now a component under components/ for easier testing

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfigProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text transition-colors duration-300">
              <Navbar />
              <main>
                <ErrorBoundary>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/schedule" element={<SchedulePage />} />
                      <Route path="/content" element={<ContentPage />} />
                      <Route path="/merch" element={<MerchPage />} />
                      <Route path="/gallery" element={<GalleryPage />} />
                      <Route path="/connect" element={<ContactPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          </Router>
        </ConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;