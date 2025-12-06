

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
  const [themeUploading, setThemeUploading] = useState<string | null>(null);

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

  const handleThemeImageUpload = async (key: keyof SiteTheme, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThemeUploading(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      updateSiteTheme({ [key]: url });
    } catch (err) {
      alert('上传失败，请重试');
    } finally {
      setThemeUploading(null);
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
              <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
                <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
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
                <button onClick={() => setIsThemeModalOpen(true)} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${(isScrolled || location.pathname !== '/') ? 'bg-white text-slate-600 border-slate-200 hover:border-amber-300' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`} title="网站装修"><Palette size={14} /> 装修</button>
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
                      {!isGuest ? (<>
                        <button onClick={() => { setIsAvatarModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"><Camera size={16} className="text-slate-400" /> 修改头像</button>
                        <button onClick={() => { setIsChangePassModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"><Key size={16} className="text-slate-400" /> 修改密码</button>
                      </>) : (<div className="px-3 py-2 text-xs text-slate-400 italic text-center">访客无权进行操作</div>)}
                    </div>
                    <div className="p-1 border-t border-slate-50">
                      {user.role === 'admin' && (<button onClick={() => { setIsAddUserModalOpen(true); setIsUserMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"><UserPlus size={16} className="text-slate-400" /> 添加账户</button>)}
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
        {isMobileMenuOpen && (<div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 absolute w-full shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-amber-600" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="flex items-center gap-3">{link.icon} {link.name}</span>
              </Link>
            ))}
            {user.role === 'admin' && (
              <button onClick={() => { setIsThemeModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-3">
                <Palette size={18} /> 网站装修
              </button>
            )}
          </div>
        </div>)}
      </nav>

      {/* Theme Decoration Modal */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-serif">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Palette className="text-amber-500" /> 装修您的猪窝</h3>
              <button onClick={() => setIsThemeModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-sm font-bold text-slate-700 mb-3 block flex justify-between items-center">
                  <span>全站背景图 (Main Background)</span>
                  <span className="text-xs text-slate-400 font-normal">建议 1920x1080</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                    <img src={siteTheme.mainBg} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <label className="flex-1 cursor-pointer group">
                    <input type="file" accept="image/*" onChange={(e) => handleThemeImageUpload('mainBg', e)} className="hidden" disabled={!!themeUploading} />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${themeUploading === 'mainBg' ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-300 group-hover:border-amber-400 group-hover:bg-amber-50 text-slate-500 group-hover:text-amber-600'}`}>
                      {themeUploading === 'mainBg' ? '上传中...' : <><Upload size={16} /> 上传新背景</>}
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-sm font-bold text-slate-700 mb-3 block flex justify-between items-center">
                  <span>首页横幅 (Home Banner)</span>
                  <span className="text-xs text-slate-400 font-normal">当前首页背景</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                    <img src={siteTheme.homeBanner} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <label className="flex-1 cursor-pointer group">
                    <input type="file" accept="image/*" onChange={(e) => handleThemeImageUpload('homeBanner', e)} className="hidden" disabled={!!themeUploading} />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${themeUploading === 'homeBanner' ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-300 group-hover:border-amber-400 group-hover:bg-amber-50 text-slate-500 group-hover:text-amber-600'}`}>
                      {themeUploading === 'homeBanner' ? '上传中...' : <><Upload size={16} /> 上传新横幅</>}
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-sm font-bold text-slate-700 mb-3 block flex justify-between items-center">
                  <span>登录页背景 (Login Background)</span>
                  <span className="text-xs text-slate-400 font-normal">第一印象很重要</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative">
                    <img src={siteTheme.loginBg} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                  <label className="flex-1 cursor-pointer group">
                    <input type="file" accept="image/*" onChange={(e) => handleThemeImageUpload('loginBg', e)} className="hidden" disabled={!!themeUploading} />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${themeUploading === 'loginBg' ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-300 group-hover:border-amber-400 group-hover:bg-amber-50 text-slate-500 group-hover:text-amber-600'}`}>
                      {themeUploading === 'loginBg' ? '上传中...' : <><Upload size={16} /> 上传背景</>}
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center text-xs text-slate-400">
              <p>提示：图片将保存到服务器，所有设备均可同步显示。</p>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals (Add User, Change Password, Avatar) - Keeping generic placeholders for simplicity or copying previous logic if needed. 
          Since the user request focused on Theme, I will populate Add User / Change Pass with basic forms. 
      */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">添加家庭成员</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="用户名 (如: 爷爷)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400" required />
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">创建用户 (默认密码 123456)</button>
            </form>
          </div>
        </div>
      )}

      {isChangePassModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">修改密码</h3>
              <button onClick={() => setIsChangePassModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input type="password" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} placeholder="新密码" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400" required />
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">确认修改</button>
            </form>
          </div>
        </div>
      )}

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">修改头像</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-500" /></button>
            </div>
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img src={avatarUploadPreview || user.avatar} className="w-full h-full object-cover" alt="Preview" />
              </div>
              <label className="block w-full cursor-pointer">
                <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
                <span className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all">选择图片...</span>
              </label>
              <button onClick={handleSaveAvatar} disabled={!avatarUploadPreview} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all">保存头像</button>
            </div>
          </div>
        </div>
      )}
    </>

  );
};
export default Navbar;
