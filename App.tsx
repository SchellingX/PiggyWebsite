
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    const { user } = useData();

    if (!user) {
        return <Login />;
    }

    return (
        <div className="min-h-screen bg-[#FDFCFD] font-sans text-slate-900 flex flex-col selection:bg-rose-200 selection:text-rose-900">
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24">
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
