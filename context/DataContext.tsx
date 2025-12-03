import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { BlogPost, Photo, AppItem, User, Reminder, HomeSection } from '../types';
import { MOCK_BLOGS, MOCK_PHOTOS, MOCK_APPS, ALL_USERS, MOCK_REMINDERS } from '../constants';

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

  // 相册操作
  addPhoto: (photo: Photo) => void;

  // 应用/提醒操作
  addApp: (app: AppItem) => void;
  addReminder: (text: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  // UI 操作
  toggleHomeEditing: () => void;
  updateHomeSections: (sections: HomeSection[]) => void;
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
  // 初始使用 Mock 数据防止页面闪烁，随后会被后端数据覆盖
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_USERS);
  const [blogs, setBlogs] = useState<BlogPost[]>(MOCK_BLOGS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [homeSections, setHomeSections] = useState<HomeSection[]>(DEFAULT_SECTIONS);
  
  const [isHomeEditing, setIsHomeEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 标记初始化是否完成，防止将初始状态误保存回服务器
  const isInitialized = useRef(false);

  // --- 后端持久化逻辑 ---

  // 1. 组件挂载时加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          
          if (data.initialized === false) {
             // 情况 A: 服务器 db.json 不存在或为空
             // 动作: 使用当前的 Mock 数据初始化服务器
             console.log("服务器数据为空，正在初始化 Mock 数据...");
             saveToBackend({ allUsers, blogs, photos, apps, reminders, homeSections });
          } else {
             // 情况 B: 服务器有数据
             // 动作: 使用服务器数据覆盖本地状态
             if (data.allUsers) setAllUsers(data.allUsers);
             if (data.blogs) setBlogs(data.blogs);
             if (data.photos) setPhotos(data.photos);
             if (data.apps) setApps(data.apps);
             if (data.reminders) setReminders(data.reminders);
             if (data.homeSections) setHomeSections(data.homeSections);
          }
        }
      } catch (error) {
        console.error("无法从后端获取数据，使用本地 Mock。", error);
      } finally {
        setIsLoading(false);
        isInitialized.current = true; // 标记初始化完成
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. 数据保存辅助函数
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

  // 3. 自动保存副作用
  // 监听所有核心数据变化，防抖保存到服务器
  useEffect(() => {
      // 避免在初始化阶段保存
      if (!isInitialized.current) return;

      // 延迟 1 秒保存，减少请求频率
      const timer = setTimeout(() => {
          saveToBackend({
              allUsers,
              blogs,
              photos,
              apps,
              reminders,
              homeSections
          });
      }, 1000); 

      return () => clearTimeout(timer);
  }, [allUsers, blogs, photos, apps, reminders, homeSections]);


  // --- Action 具体实现 ---

  // 登录逻辑
  const login = (name: string, password: string) => {
    const foundUser = allUsers.find(u => u.name === name && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsHomeEditing(false); // 登出时退出编辑模式
  };

  // 添加新用户
  const addUser = (name: string, avatar: string, password: string) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      avatar,
      role: 'member', // 默认为普通成员
      password,
    };
    setAllUsers(prev => [...prev, newUser]);
  };

  const changePassword = (newPass: string) => {
    if (user) {
        const updatedUser = { ...user, password: newPass };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  // 重置密码（用于找回密码功能）
  const resetUserPassword = (name: string, newPass: string) => {
      const targetUser = allUsers.find(u => u.name === name);
      if (targetUser) {
          const updatedUser = { ...targetUser, password: newPass };
          setAllUsers(prev => prev.map(u => u.id === targetUser.id ? updatedUser : u));
          return true;
      }
      return false;
    }

  const updateUserAvatar = (newAvatar: string) => {
      if (user) {
          const updatedUser = { ...user, avatar: newAvatar };
          setUser(updatedUser);
          setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      }
  };

  // 博客操作
  const addBlog = (post: BlogPost) => {
    setBlogs(prev => [post, ...prev]);
  };

  const updateBlog = (updatedPost: BlogPost) => {
    setBlogs(prev => prev.map(b => b.id === updatedPost.id ? updatedPost : b));
  };

  const deleteBlog = (id: string) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const likeBlog = (id: string) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
  };

  // 相册操作
  const addPhoto = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev]);
  };

  // 应用与提醒操作
  const addApp = (app: AppItem) => {
    setApps(prev => [...prev, app]);
  };

  const addReminder = (text: string) => {
    setReminders(prev => [...prev, { id: Date.now().toString(), text, completed: false }]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // UI 布局操作
  const toggleHomeEditing = () => {
    setIsHomeEditing(!isHomeEditing);
  };

  const updateHomeSections = (sections: HomeSection[]) => {
    setHomeSections(sections);
  };

  return (
    <DataContext.Provider value={{ 
      user, 
      allUsers,
      blogs, 
      photos, 
      apps, 
      reminders,
      homeSections,
      isHomeEditing,
      isLoading,
      login,
      logout,
      resetUserPassword,
      changePassword,
      updateUserAvatar,
      addUser,
      addBlog, 
      updateBlog,
      deleteBlog, 
      likeBlog, 
      addPhoto, 
      addApp,
      addReminder,
      toggleReminder,
      deleteReminder,
      toggleHomeEditing,
      updateHomeSections
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
