
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Gallery from './pages/Gallery';
import Apps from './pages/Apps';
import Search from './pages/Search';
import Login from './pages/Login';

const MainLayout: React.FC = () => {
    const { user, siteTheme } = useData();
    const location = useLocation();

    if (!user) {
        return <Login />;
    }

    // Dynamic background handling
    // Home page has its own hero, so the global bg needs to be subtle there or covered.
    
    return (
        <div 
          className="min-h-screen font-serif text-slate-900 flex flex-col selection:bg-amber-200 selection:text-amber-900 bg-cover bg-center bg-fixed bg-no-repeat transition-all duration-500"
          style={{ backgroundImage: `url('${siteTheme.mainBg}')` }}
        >
          {/* Global overlay. Lighter on Home page to let the Hero shine, stronger on others for readability */}
          <div className={`absolute inset-0 bg-[#FDFCFD] z-0 fixed transition-opacity duration-300 ${location.pathname === '/' ? 'opacity-80' : 'opacity-95'}`} />
          
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className={`flex-1 w-full ${location.pathname === '/' ? 'p-0 max-w-none' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24'}`}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/apps" element={<Apps />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
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
         <MainLayout />
      </Router>
    </DataProvider>
  );
};

export default App;
