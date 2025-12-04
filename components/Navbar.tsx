
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Image, Grid, Search, Menu, X, ChevronDown, UserPlus, Key, Camera, Layout, LogOut, Palette, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';

const Navbar: React.FC = () => {
  const { user, logout, addUser, isHomeEditing, toggleHomeEditing, changePassword, updateUserAvatar, updateSiteTheme, siteTheme } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // 模态框状态管理
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false); 

  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // 新增用户表单状态
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState<string>('');
  
  // 修改密码表单状态
  const [newPasswordInput, setNewPasswordInput] = useState('');
  
  // 修改头像预览状态
  const [avatarUploadPreview, setAvatarUploadPreview] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 监听滚动与点击外部事件
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

  // --- 处理函数 ---

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
      const avatar = newUserAvatar || `/assets/avatar-default.png`;
      addUser(newUserName, avatar, newUserPassword);
      setIsAddUserModalOpen(false);
      setNewUserName('');
      setNewUserPassword('');
      setNewUserAvatar('');
      setIsUserMenuOpen(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPasswordInput) {
          changePassword(newPasswordInput);
          setIsChangePassModalOpen(false);
          setNewPasswordInput('');
          alert('密码修改成功！');
      }
  };

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
  
  const handleThemeImageUpload = (key: keyof typeof siteTheme, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateSiteTheme({ [key]: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const isGuest = user.role === 'guest';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-serif ${
          isScrolled || isMobileMenuOpen || location.pathname !== '/'
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100'
            : 'bg-transparent text-white' 
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo 区域 */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <img src="/assets/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className={`font-bold tracking-tight text-xl ${isScrolled || location.pathname !== '/' ? 'text-slate-800' : 'text-white drop-shadow-md'}`}>猪一家</span>
            </Link>

            {/* 桌面端菜单 */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isActive(link.path)
                      ? 'bg-amber-400 text-white shadow-md shadow-amber-200'
                      : (isScrolled || location.pathname !== '/') ? 'text-slate-600 hover:bg-amber-50 hover:text-amber-800' : 'text-white/90 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* 管理员可见：页面布局调整按钮 */}
              {user.role === 'admin' && location.pathname === '/' && (
                <button
                  onClick={toggleHomeEditing}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                    isHomeEditing 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : (isScrolled || location.pathname !== '/') ? 'bg-white text-slate-600 border-slate-200 hover:border-amber-300' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                  title="调整布局"
                >
                  <Layout size={14} />
                </button>
              )}
              
              {/* 管理员可见：主题装修按钮 */}
              {user.role === 'admin' && (
                <button
                  onClick={() => setIsThemeModalOpen(true)}
                  className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                     (isScrolled || location.pathname !== '/') ? 'bg-white text-slate-600 border-slate-200 hover:border-amber-300' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                  title="网站装修"
                >
                  <Palette size={14} />
                </button>
              )}

              {/* 用户下拉菜单 */}
              <div className="relative ml-2" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${
                      (isScrolled || location.pathname !== '/') ? 'hover:bg-white/80 border-transparent hover:border-amber-100 bg-white/40' : 'hover:bg-black/20 border-transparent bg-black/10 text-white'
                  }`}
                >
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
                  <span className={`text-sm font-bold hidden sm:block ${(isScrolled || location.pathname !== '/') ? 'text-slate-700' : 'text-white'}`}>{user.name}</span>
                  <ChevronDown size={14} className={(isScrolled || location.pathname !== '/') ? "text-slate-400" : "text-white/70"} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-amber-50 overflow-hidden animate-fade-in origin-top-right z-[60]">
                    <div className="px-4 py-4 border-b border-slate-50 bg-amber-50/30">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">当前登录</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider mt-1 inline-block ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                        user.role === 'member' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' ? '管理员' : user.role === 'member' ? '用户' : '访客'}
                      </span>
                    </div>
                    
                    <div className="p-1">
                        {!isGuest && (
                          <>
                            <button
                               onClick={() => { setIsAvatarModalOpen(true); setIsUserMenuOpen(false); }}
                               className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <Camera size={16} className="text-slate-400" /> 修改头像
                            </button>
                            <button
                               onClick={() => { setIsChangePassModalOpen(true); setIsUserMenuOpen(false); }}
                               className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <Key size={16} className="text-slate-400" /> 修改密码
                            </button>
                          </>
                        )}
                        {isGuest && (
                          <div className="px-3 py-2 text-xs text-slate-400 italic text-center">访客无法修改资料</div>
                        )}
                    </div>

                    <div className="p-1 border-t border-slate-50">
                      {!isGuest && (
                          <button
                            onClick={() => {
                              setIsAddUserModalOpen(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                             <UserPlus size={16} className="text-slate-400" /> 添加账户
                          </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors"
                      >
                         <LogOut size={16} /> 退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 移动端菜单按钮 */}
              <div className="md:hidden ml-2">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`p-2 rounded-lg transition-colors ${
                      (isScrolled || location.pathname !== '/') ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/20'
                  }`}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 移动端菜单下拉内容 */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 absolute w-full shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold flex items-center gap-3 transition-colors ${
                    isActive(link.path)
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              {user.role === 'admin' && (
                  <button
                    onClick={() => { setIsThemeModalOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl text-base font-bold flex items-center gap-3 text-slate-600 hover:bg-slate-50"
                  >
                     <Palette size={18} /> 网站装修
                  </button>
              )}
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-base font-bold flex items-center gap-3 text-red-500 hover:bg-red-50"
              >
                 <LogOut size={18} /> 退出登录
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 网站装修模态框 */}
      {isThemeModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-serif">
              <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Palette size={20}/></div>
                          <h2 className="text-2xl font-bold text-slate-800">网站外观装修</h2>
                      </div>
                      <button onClick={() => setIsThemeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                      {/* 主页头部Banner */}
                      <div className="space-y-3">
                          <h3 className="font-bold text-slate-700">主页头部海报</h3>
                          <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-100 border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors">
                              <img src={siteTheme.homeBanner} className="w-full h-full object-cover" alt="Home Banner"/>
                              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                  <Upload size={24} className="mb-2"/>
                                  <span className="text-xs font-bold">点击更换</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleThemeImageUpload('homeBanner', e)} />
                              </label>
                          </div>
                          <p className="text-xs text-slate-500">建议尺寸: 1920x1080, 将作为主页全屏背景展示。</p>
                      </div>

                      {/* 全站通用背景 */}
                      <div className="space-y-3">
                          <h3 className="font-bold text-slate-700">全站通用背景</h3>
                          <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-100 border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors">
                              <img src={siteTheme.mainBg} className="w-full h-full object-cover" alt="Main BG"/>
                              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                  <Upload size={24} className="mb-2"/>
                                  <span className="text-xs font-bold">点击更换</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleThemeImageUpload('mainBg', e)} />
                              </label>
                          </div>
                          <p className="text-xs text-slate-500">显示在博客、相册等内页的背景图。</p>
                      </div>

                      {/* 登录页背景 */}
                      <div className="space-y-3">
                          <h3 className="font-bold text-slate-700">登录页背景</h3>
                          <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-100 border-2 border-dashed border-slate-300 hover:border-amber-400 transition-colors">
                              <img src={siteTheme.loginBg} className="w-full h-full object-cover" alt="Login BG"/>
                              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                  <Upload size={24} className="mb-2"/>
                                  <span className="text-xs font-bold">点击更换</span>
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleThemeImageUpload('loginBg', e)} />
                              </label>
                          </div>
                          <p className="text-xs text-slate-500">独立于全站背景，仅在登录页显示。</p>
                      </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 text-right">
                      <button onClick={() => setIsThemeModalOpen(false)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">完成装修</button>
                  </div>
              </div>
          </div>
      )}

      {/* 用户相关模态框 (保持不变) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
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
                  className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-amber-400 transition-colors relative group"
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
                <label className="block text-sm font-bold text-slate-700 mb-1">昵称</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="例如：黑土猪"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">初始密码</label>
                <input
                  type="text"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="例如：123456"
                />
              </div>
              <button
                type="submit"
                className="w-full px-5 py-3 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus size={18} /> 创建用户
              </button>
            </form>
          </div>
        </div>
      )}

      {isChangePassModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">修改密码</h2>
              <button onClick={() => setIsChangePassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-1">新密码</label>
                    <input
                        type="text"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">保存新密码</button>
            </form>
          </div>
        </div>
      )}

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-serif">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">修改头像</h2>
              <button onClick={() => setIsAvatarModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div 
                className="w-32 h-32 mx-auto rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-amber-400 transition-colors relative group mb-6"
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
                className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
