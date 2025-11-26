import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Image, Grid, Search, Menu, X, ChevronDown, UserPlus, Settings, Layout } from 'lucide-react';
import { useData } from '../context/DataContext';

const Navbar: React.FC = () => {
  const { user, allUsers, switchUser, addUser, isHomeEditing, toggleHomeEditing } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // New User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName) {
      // Use default avatar if none uploaded
      const avatar = newUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserName}`;
      addUser(newUserName, avatar);
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserAvatar('');
      setIsUserMenuOpen(false);
    }
  };

  return (
    <>
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
                猪
              </div>
              <span className="font-semibold text-slate-800 tracking-tight text-lg">猪一家</span>
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
              {/* Admin Page Adjustment Button */}
              {user.role === 'admin' && location.pathname === '/' && (
                <button
                  onClick={toggleHomeEditing}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    isHomeEditing 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Layout size={14} />
                  {isHomeEditing ? '完成调整' : '调整页面'}
                </button>
              )}

              {/* User Menu */}
              <div className="relative ml-2" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/50 border border-transparent hover:border-slate-100 transition-all"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-white" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in origin-top-right">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">当前登录</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                        user.role === 'admin' ? 'bg-rose-100 text-rose-600' : 
                        user.role === 'member' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' ? '管理员' : user.role === 'member' ? '用户' : '访客'}
                      </span>
                    </div>
                    <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
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
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover bg-slate-100" />
                          <span className="flex-1 truncate">{u.name}</span>
                          {user.id === u.id && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                        </button>
                      ))}
                    </div>
                    <div className="p-1 border-t border-slate-50">
                      <button
                        onClick={() => {
                          setIsAddUserModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <UserPlus size={14} />
                        </div>
                        添加账户
                      </button>
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
              {user.role === 'admin' && location.pathname === '/' && (
                 <button
                   onClick={() => {
                     toggleHomeEditing();
                     setIsMobileMenuOpen(false);
                   }}
                   className="w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50"
                 >
                   <Layout size={18} />
                   {isHomeEditing ? '完成调整' : '调整页面'}
                 </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">添加新家庭成员</h2>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-rose-400 transition-colors relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newUserAvatar ? (
                    <img src={newUserAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <UserPlus className="mx-auto text-slate-400 mb-1" size={24} />
                      <span className="text-[10px] text-slate-400">上传头像</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">更换</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="例如：乔治"
                />
              </div>

              <button
                type="submit"
                className="w-full px-5 py-3 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={18} /> 创建用户
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;