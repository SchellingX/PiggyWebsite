

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Image, Menu, X, ChevronDown, LogOut, Palette, Upload, UserPlus, Key, Camera } from 'lucide-react';
import { useData } from '../context/DataContext';
import { SiteTheme } from '../types';

const Navbar: React.FC = () => {
  const { user, logout, siteTheme, updateSiteTheme, addUser, changePassword, updateUserAvatar } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Modal states
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [avatarUploadPreview, setAvatarUploadPreview] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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

  if (!user) return null;

  const navLinks = [
    { name: '首页', path: '/', icon: <Home size={18} /> },
    { name: '博客', path: '/blog', icon: <BookOpen size={18} /> },
    { name: '相册', path: '/gallery', icon: <Image size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleThemeImageUpload = (key: keyof SiteTheme, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateSiteTheme({ [key]: reader.result as string });
      reader.readAsDataURL(file);
    }
  };
  
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName) {
      await addUser(newUserName, newUserAvatar || '/assets/avatar-default.png');
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserAvatar('');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput && user) {
      await changePassword(user.id, newPasswordInput);
      setIsChangePassModalOpen(false);
      setNewPasswordInput('');
      alert('密码修改成功！');
    }
  };
  
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (avatarUploadPreview && user) {
      await updateUserAvatar(user.id, avatarUploadPreview);
      setIsAvatarModalOpen(false);
      setAvatarUploadPreview('');
    }
  };

  const isGuest = user.role === 'guest';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-serif ${isScrolled || isMobileMenuOpen || location.pathname !== '/' ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100' : 'bg-transparent text-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-md border-2 border-white"><img src="/assets/logo.png" alt="Logo" className="w-6 h-6 object-contain" /></div>
              <span className={`font-bold tracking-tight text-xl ${isScrolled || location.pathname !== '/' ? 'text-slate-800' : 'text-white drop-shadow-md'}`}>猪一家</span>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${isActive(link.path) ? 'bg-amber-400 text-white shadow-md shadow-amber-200' : (isScrolled || location.pathname !== '/') ? 'text-slate-600 hover:bg-amber-50 hover:text-amber-800' : 'text-white/90 hover:bg-white/20 hover:text-white'}`}>
                  {link.icon} {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <button onClick={() => setIsThemeModalOpen(true)} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${(isScrolled || location.pathname !== '/') ? 'bg-white text-slate-600 border-slate-200 hover:border-amber-300' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`} title="网站装修"><Palette size={14} /></button>
              )}
              <div className="relative ml-2" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${(isScrolled || location.pathname !== '/') ? 'hover:bg-white/80 border-transparent hover:border-amber-100 bg-white/40' : 'hover:bg-black/20 border-transparent bg-black/10 text-white'}`}>
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                  <span className={`text-sm font-bold hidden sm:block ${(isScrolled || location.pathname !== '/') ? 'text-slate-700' : 'text-white'}`}>{user.name}</span>
                  <ChevronDown size={14} className={(isScrolled || location.pathname !== '/') ? "text-slate-400" : "text-white/70"} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-amber-50 overflow-hidden animate-fade-in origin-top-right z-[60]">
                    <div className="px-4 py-4 border-b border-slate-50 bg-amber-50/30">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">当前登录</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider mt-1 inline-block ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : user.role === 'member' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{user.role}</span>
                    </div>
                    <div className="p-1">
                      {!isGuest ? ( <>
                        <button onClick={() => { setIsAvatarModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"><Camera size={16} className="text-slate-400" /> 修改头像</button>
                        <button onClick={() => { setIsChangePassModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"><Key size={16} className="text-slate-400" /> 修改密码</button>
                      </>) : (<div className="px-3 py-2 text-xs text-slate-400 italic text-center">访客无权进行操作</div>)}
                    </div>
                    <div className="p-1 border-t border-slate-50">
                      {user.role === 'admin' && (<button onClick={() => { setIsAddUserModalOpen(true); setIsUserMenuOpen(false);}} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"><UserPlus size={16} className="text-slate-400" /> 添加账户</button>)}
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"><LogOut size={16} /> 退出登录</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="md:hidden ml-2">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-lg transition-colors ${(isScrolled || location.pathname !== '/') ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/20'}`}><X size={24} /></button>
              </div>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (<div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 absolute w-full shadow-xl">...</div>)}
      </nav>
      {isThemeModalOpen && (<div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-serif">...</div>)}
      {isAddUserModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">...</div>)}
      {isChangePassModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">...</div>)}
      {isAvatarModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">...</div>)}
    </>
  );
};
export default Navbar;
