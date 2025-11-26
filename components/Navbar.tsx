import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Image, Grid, Search, Menu, X, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';

const Navbar: React.FC = () => {
  const { user, allUsers, switchUser } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: '首页', path: '/', icon: <Home size={18} /> },
    { name: '博客', path: '/blog', icon: <BookOpen size={18} /> },
    { name: '相册', path: '/gallery', icon: <Image size={18} /> },
    { name: '应用', path: '/apps', icon: <Grid size={18} /> },
    { name: '搜索', path: '/search', icon: <Search size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
              P
            </div>
            <span className="font-semibold text-slate-800 tracking-tight text-lg">佩奇家庭</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* User Menu */}
            <div className="relative ml-2" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/50 border border-transparent hover:border-slate-100 transition-all"
              >
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">当前登录</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                      user.role === 'admin' ? 'bg-rose-100 text-rose-600' : 
                      user.role === 'member' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="p-1">
                    <p className="px-3 py-2 text-xs text-slate-400 font-semibold">切换账号</p>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 transition-colors ${
                          user.id === u.id ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full" />
                        <span className="flex-1">{u.name}</span>
                        {user.id === u.id && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition-colors ${
                  isActive(link.path)
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;