
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Image, Grid, Search, Menu, X, ChevronDown, UserPlus, Settings, Layout, LogOut, Key, Camera } from 'lucide-react';
import { useData } from '../context/DataContext';

const Navbar: React.FC = () => {
  const { user, logout, addUser, isHomeEditing, toggleHomeEditing, changePassword, updateUserAvatar } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // New User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState<string>('');
  
  // Change Password State
  const [newPasswordInput, setNewPasswordInput] = useState('');
  
  // Change Avatar State
  const [avatarUploadPreview, setAvatarUploadPreview] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  if (!user) return null;

  const navLinks = [
    { name: '首页', path: '/', icon: <Home size={18} /> },
    { name: '博客', path: '/blog', icon: <BookOpen size={18} /> },
    { name: '相册', path: '/gallery', icon: <Image size={18} /> },
    { name: '应用', path: '/apps', icon: <Grid size={18} /> },
    { name: '搜索', path: '/search', icon: <Search size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handlers for Add User
  const handleNewUserAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (newUserName && newUserPassword) {
      const avatar = newUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserName}`;
      addUser(newUserName, avatar, newUserPassword);
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserPassword('');
      setNewUserAvatar('');
      setIsUserMenuOpen(false);
    }
  };

  // Handlers for Change Password
  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPasswordInput) {
          changePassword(newPasswordInput);
          setIsChangePassModalOpen(false);
          setNewPasswordInput('');
          alert('密码修改成功！');
      }
  };

  // Handlers for Change Avatar
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUploadPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
  };

  const handleSaveAvatar = () => {
      if (avatarUploadPreview) {
          updateUserAvatar(avatarUploadPreview);
          setIsAvatarModalOpen(false);
          setAvatarUploadPreview('');
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
                    
                    <div className="p-1">
                        <button
                           onClick={() => { setIsAvatarModalOpen(true); setIsUserMenuOpen(false); }}
                           className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Camera size={16} className="text-slate-400" /> 修改头像
                        </button>
                        <button
                           onClick={() => { setIsChangePassModalOpen(true); setIsUserMenuOpen(false); }}
                           className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <Key size={16} className="text-slate-400" /> 修改密码
                        </button>
                    </div>

                    <div className="p-1 border-t border-slate-50">
                      <button
                        onClick={() => {
                          setIsAddUserModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                         <UserPlus size={16} className="text-slate-400" /> 添加账户
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
                      >
                         <LogOut size={16} /> 退出登录
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
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 text-red-500 hover:bg-red-50"
              >
                 <LogOut size={18} /> 退出登录
              </button>
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
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-2">
                <div 
                  className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-rose-400 transition-colors relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newUserAvatar ? (
                    <img src={newUserAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <UserPlus className="mx-auto text-slate-400 mb-1" size={20} />
                      <span className="text-[10px] text-slate-400">头像</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleNewUserAvatarUpload}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  placeholder="例如：黑土猪"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">初始密码</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                  placeholder="例如：123456"
                />
              </div>

              <button
                type="submit"
                className="w-full px-5 py-3 rounded-full bg-rose-500 text-white font-medium hover:bg-rose-600 shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus size={18} /> 创建用户
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePassModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">修改密码</h2>
              <button onClick={() => setIsChangePassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                    <input
                        type="text"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">保存新密码</button>
            </form>
          </div>
        </div>
      )}

      {/* Change Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">修改头像</h2>
              <button onClick={() => setIsAvatarModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div 
                className="w-32 h-32 mx-auto rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-rose-400 transition-colors relative group mb-6"
                onClick={() => avatarInputRef.current?.click()}
            >
                {avatarUploadPreview || user.avatar ? (
                    <img src={avatarUploadPreview || user.avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <Camera className="text-slate-400" size={32} />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">更换</span>
                </div>
            </div>
            <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarFileSelect}
            />
            
            <button 
                onClick={handleSaveAvatar} 
                disabled={!avatarUploadPreview}
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                保存头像
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
