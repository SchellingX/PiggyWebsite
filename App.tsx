
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { ASSETS } from './constants';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Blog = lazy(() => import('./pages/Blog'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Login = lazy(() => import('./pages/Login'));

const MainLayout: React.FC = () => {
  const { user, siteTheme } = useData();
  const location = useLocation();

  if (!user) {
    return <Login />;
  }

  // Dynamic background handling
  const getBackgroundImage = () => {
    switch (location.pathname) {
      case '/': return `url('${ASSETS.bgMain}')`;
      case '/blog': return `url('${ASSETS.slide2}')`;
      case '/gallery': return `url('${ASSETS.slide3}')`;
      case '/reminders': return `url('${ASSETS.bgMain}')`;
      case '/login': return `url('${ASSETS.bgLogin}')`;
      default: return `url('${ASSETS.bgMain}')`;
    }
  };

  return (
    <div
      className="min-h-screen font-serif text-slate-900 flex flex-col selection:bg-amber-200 selection:text-amber-900 bg-cover bg-center bg-fixed bg-no-repeat transition-all duration-500"
      style={{ backgroundImage: getBackgroundImage() }}
    >


      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className={`flex-1 w-full ${location.pathname === '/' ? 'p-0 max-w-none' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24'}`}>
          <Suspense fallback={<div className="text-center p-8">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFCFD] text-slate-900">Initializing Piggy Website...</div>}>
          <MainLayout />
        </Suspense>
      </Router>
    </DataProvider>
  );
};

export default App;
