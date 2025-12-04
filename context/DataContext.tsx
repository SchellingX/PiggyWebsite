
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { BlogPost, Photo, AppItem, User, Reminder, HomeSection, SiteTheme } from '../types';
import { MOCK_BLOGS, MOCK_PHOTOS, MOCK_APPS, ALL_USERS, MOCK_REMINDERS, DEFAULT_SITE_THEME } from '../constants';

// --- 类型定义 ---
interface DataContextType {
  // 核心数据状态
  user: User | null;
  allUsers: User[];
  blogs: BlogPost[];
  photos: Photo[];
  apps: AppItem[];
  reminders: Reminder[];
  homeSections: HomeSection[];
  siteTheme: SiteTheme;
  isHomeEditing: boolean;
  isLoading: boolean;
  
  // 认证操作
  login: (name: string, password: string) => boolean;
  logout: () => void;
  resetUserPassword: (name: string, newPass: string) => boolean;
  changePassword: (newPass: string) => void;
  updateUserAvatar: (newAvatar: string) => void;
  addUser: (name: string, avatar: string, password: string) => void;

  // 博客操作
  addBlog: (post: BlogPost) => void;
  updateBlog: (post: BlogPost) => void;
  deleteBlog: (id: string) => void;
  likeBlog: (id: string) => void;
  collectBlog: (id: string) => void;
  commentBlog: (id: string, text: string) => void;

  // 相册操作
  addPhoto: (photo: Photo) => void;
  likePhoto: (id: string) => void;
  collectPhoto: (id: string) => void;
  commentPhoto: (id: string, text: string) => void;

  // 应用/提醒操作
  addApp: (app: AppItem) => void;
  addReminder: (text: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // UI 操作
  toggleHomeEditing: () => void;
  updateHomeSections: (sections: HomeSection[]) => void;
  updateSiteTheme: (theme: Partial<SiteTheme>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// 主页布局默认配置
const DEFAULT_SECTIONS: HomeSection[] = [
  { id: 'carousel', type: 'carousel', visible: true, title: '轮播图' },
  { id: 'apps', type: 'apps', visible: true, title: '快速应用' },
  { id: 'blogs', type: 'blogs', visible: true, title: '最新博客' },
  { id: 'notices', type: 'notices', visible: true, title: '家庭公告栏' },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- 状态初始化 ---
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_USERS);
  const [blogs, setBlogs] = useState<BlogPost[]>(MOCK_BLOGS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [homeSections, setHomeSections] = useState<HomeSection[]>(DEFAULT_SECTIONS);
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(DEFAULT_SITE_THEME);
  
  const [isHomeEditing, setIsHomeEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isInitialized = useRef(false);

  // --- 后端持久化逻辑 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.initialized === false) {
             saveToBackend({ allUsers, blogs, photos, apps, reminders, homeSections, siteTheme });
          } else {
             if (data.allUsers) setAllUsers(data.allUsers);
             if (data.blogs) setBlogs(data.blogs);
             if (data.photos) setPhotos(data.photos);
             if (data.apps) setApps(data.apps);
             if (data.reminders) setReminders(data.reminders);
             if (data.homeSections) setHomeSections(data.homeSections);
             if (data.siteTheme) setSiteTheme(data.siteTheme);
          }
        }
      } catch (error) {
        console.error("无法从后端获取数据，使用本地 Mock。", error);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToBackend = async (data: any) => {
      try {
          await fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
      } catch (error) {
          console.error("保存数据到后端失败", error);
      }
  };

  useEffect(() => {
      if (!isInitialized.current) return;
      const timer = setTimeout(() => {
          saveToBackend({ allUsers, blogs, photos, apps, reminders, homeSections, siteTheme });
      }, 1000); 
      return () => clearTimeout(timer);
  }, [allUsers, blogs, photos, apps, reminders, homeSections, siteTheme]);


  // --- Action 具体实现 ---

  // Auth
  const login = (name: string, password: string) => {
    const foundUser = allUsers.find(u => u.name === name && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => { setUser(null); setIsHomeEditing(false); };

  const addUser = (name: string, avatar: string, password: string) => {
    // 只有非访客可以添加用户（甚至只有管理员，这里暂不严格限制，UI层限制）
    if (user?.role === 'guest') return;
    const newUser: User = { id: `u_${Date.now()}`, name, avatar, role: 'member', password };
    setAllUsers(prev => [...prev, newUser]);
  };

  const changePassword = (newPass: string) => {
    // 安全检查：访客不能修改密码
    if (!user || user.role === 'guest') {
        console.warn("访客无权修改密码");
        return;
    }
    const updatedUser = { ...user, password: newPass };
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  const resetUserPassword = (name: string, newPass: string) => {
      const targetUser = allUsers.find(u => u.name === name);
      if (targetUser) {
          // 禁止重置管理员密码（除非自己是管理员，这里简化逻辑）
          const updatedUser = { ...targetUser, password: newPass };
          setAllUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
          return true;
      }
      return false;
    }

  const updateUserAvatar = (newAvatar: string) => {
      // 安全检查：访客不能修改头像
      if (!user || user.role === 'guest') {
          console.warn("访客无权修改头像");
          return;
      }
      const updatedUser = { ...user, avatar: newAvatar };
      setUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  // Blog
  const addBlog = (post: BlogPost) => { setBlogs(prev => [post, ...prev]); };
  const updateBlog = (updatedPost: BlogPost) => { setBlogs(prev => prev.map(b => b.id === updatedPost.id ? updatedPost : b)); };
  const deleteBlog = (id: string) => { setBlogs(prev => prev.filter(b => b.id !== id)); };
  
  const likeBlog = (id: string) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
  };
  
  const collectBlog = (id: string) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, isCollected: !b.isCollected } : b));
  };

  const commentBlog = (id: string, text: string) => {
      if (!user) return;
      const newComment = { id: `c_${Date.now()}`, author: user.name, text, date: new Date().toISOString() };
      setBlogs(prev => prev.map(b => b.id === id ? { ...b, comments: [...b.comments, newComment] } : b));
  };

  // Photo
  const addPhoto = (photo: Photo) => { setPhotos(prev => [photo, ...prev]); };

  const likePhoto = (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const collectPhoto = (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, isCollected: !p.isCollected } : p));
  };

  const commentPhoto = (id: string, text: string) => {
      if (!user) return;
      const newComment = { id: `pc_${Date.now()}`, author: user.name, text, date: new Date().toISOString() };
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  // Apps & Reminders
  const addApp = (app: AppItem) => { setApps(prev => [...prev, app]); };
  const addReminder = (text: string) => { setReminders(prev => [...prev, { id: Date.now().toString(), text, completed: false }]); };
  const toggleReminder = (id: string) => { setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r)); };
  const deleteReminder = (id: string) => { setReminders(prev => prev.filter(r => r.id !== id)); };

  // UI
  const toggleHomeEditing = () => { setIsHomeEditing(!isHomeEditing); };
  const updateHomeSections = (sections: HomeSection[]) => { setHomeSections(sections); };
  
  const updateSiteTheme = (newTheme: Partial<SiteTheme>) => {
      setSiteTheme(prev => ({ ...prev, ...newTheme }));
  };

  return (
    <DataContext.Provider value={{ 
      user, allUsers, blogs, photos, apps, reminders, homeSections, siteTheme, isHomeEditing, isLoading,
      login, logout, resetUserPassword, changePassword, updateUserAvatar, addUser,
      addBlog, updateBlog, deleteBlog, likeBlog, collectBlog, commentBlog,
      addPhoto, likePhoto, collectPhoto, commentPhoto,
      addApp, addReminder, toggleReminder, deleteReminder,
      toggleHomeEditing, updateHomeSections, updateSiteTheme
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
