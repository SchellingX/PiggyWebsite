import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BlogPost, Photo, AppItem, User, Reminder, HomeSection, SiteTheme } from '../types';
import { DEFAULT_SITE_THEME } from '../constants';

const api = {
  get: (endpoint: string) => fetch(endpoint).then(res => res.ok ? res.json() : Promise.reject(res)),
  post: (endpoint: string, body: any) => fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(res => res.ok ? res.json() : Promise.reject(res)),
  put: (endpoint: string, body: any) => fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(res => res.ok ? res.json() : Promise.reject(res)),
  delete: (endpoint: string) => fetch(endpoint, { method: 'DELETE' }).then(res => res.ok ? res : Promise.reject(res)),
};

interface DataContextType {
  user: User | null;
  allUsers: User[];
  blogs: BlogPost[];
  photos: Photo[];
  apps: AppItem[];
  reminders: Reminder[];
  homeSections: HomeSection[];
  siteTheme: SiteTheme;
  isLoading: boolean;
  login: (name?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  addUser: (name: string, avatar: string) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  updateUserAvatar: (userId: string, newAvatar: string) => Promise<void>;
  addBlog: (post: Omit<BlogPost, 'id' | 'date' | 'comments' | 'likes' | 'isCollected'>) => Promise<void>;
  updateBlog: (post: BlogPost) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  likeBlog: (id: string) => Promise<void>;
  collectBlog: (id: string) => Promise<void>;
  commentBlog: (id: string, author: string, text: string) => Promise<void>;
  addPhoto: (photo: Omit<Photo, 'id' | 'date' | 'comments' | 'likes' | 'isCollected'>) => Promise<void>;
  likePhoto: (id: string) => Promise<void>;
  collectPhoto: (id: string) => Promise<void>;
  commentPhoto: (id: string, author: string, text: string) => Promise<void>;
  addReminder: (text: string) => Promise<void>;
  toggleReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addApp: (app: Omit<AppItem, 'id' | 'category' | 'description'>) => Promise<void>;
  updateSiteTheme: (themeUpdate: Partial<SiteTheme>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(DEFAULT_SITE_THEME);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Optimized: Single API call instead of 5 parallel calls
        const initialDb = await api.get('/api/data');
        setBlogs(initialDb.blogs || []);
        setPhotos(initialDb.photos || []);
        setReminders(initialDb.reminders || []);
        setApps(initialDb.apps || []);
        setAllUsers(initialDb.allUsers || []);
        setHomeSections(initialDb.homeSections || []);
        setSiteTheme(initialDb.siteTheme || DEFAULT_SITE_THEME);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const login = async (name?: string, password?: string) => {
    try {
      const body = password ? { name, password } : { guest: true };
      const loggedInUser = await api.post('/api/auth/login', body);
      setUser(loggedInUser);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    }
  };

  const logout = () => setUser(null);

  const addUser = async (name: string, avatar: string) => {
    const newUser = await api.post('/api/users', { name, avatar });
    setAllUsers(prev => [...prev, newUser]);
  };

  const changePassword = async (userId: string, newPassword: string) => {
    await api.put(`/api/users/${userId}/password`, { newPassword });
  };

  const updateUserAvatar = async (userId: string, newAvatar: string) => {
    const updatedUser = await api.put(`/api/users/${userId}/avatar`, { avatar: newAvatar });
    setAllUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (user?.id === userId) setUser(updatedUser);
  };

  const addBlog = async (post: Omit<BlogPost, 'id' | 'date' | 'comments' | 'likes' | 'isCollected'>) => {
    const newBlog = await api.post('/api/blogs', post);
    setBlogs(prev => [newBlog, ...prev]);
  };

  const updateBlog = async (post: BlogPost) => {
    const updatedBlog = await api.put(`/api/blogs/${post.id}`, post);
    setBlogs(prev => prev.map(b => b.id === updatedBlog.id ? updatedBlog : b));
  };

  const deleteBlog = async (id: string) => {
    await api.delete(`/api/blogs/${id}`);
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const likeBlog = async (id: string) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
    try { await api.post(`/api/blogs/${id}/like`, {}); }
    catch (error) { setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes - 1 } : b)); }
  };

  const collectBlog = async (id: string) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, isCollected: !b.isCollected } : b));
    try { await api.post(`/api/blogs/${id}/collect`, {}); }
    catch (error) { setBlogs(prev => prev.map(b => b.id === id ? { ...b, isCollected: !b.isCollected } : b)); }
  };

  const commentBlog = async (id: string, author: string, text: string) => {
    const newComment = await api.post(`/api/blogs/${id}/comment`, { author, text });
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, comments: [...b.comments, newComment] } : b));
  };

  const addPhoto = async (photo: Omit<Photo, 'id' | 'date' | 'comments' | 'likes' | 'isCollected'>) => {
    const newPhoto = await api.post('/api/photos', photo);
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const likePhoto = async (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    try { await api.post(`/api/photos/${id}/like`, {}); }
    catch (error) { setPhotos(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p)); }
  };

  const collectPhoto = async (id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, isCollected: !p.isCollected } : p));
    try { await api.post(`/api/photos/${id}/collect`, {}); }
    catch (error) { setPhotos(prev => prev.map(p => p.id === id ? { ...p, isCollected: !p.isCollected } : p)); }
  };

  const commentPhoto = async (id: string, author: string, text: string) => {
    const newComment = await api.post(`/api/photos/${id}/comment`, { author, text });
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  const addReminder = async (text: string) => {
    const newReminder = await api.post('/api/reminders', { text });
    setReminders(prev => [...prev, newReminder]);
  };

  const toggleReminder = async (reminder: Reminder) => {
    const updatedReminderData = { ...reminder, completed: !reminder.completed };
    setReminders(prev => prev.map(r => r.id === reminder.id ? updatedReminderData : r));
    try { await api.put(`/api/reminders/${reminder.id}`, { completed: updatedReminderData.completed }); }
    catch (error) { setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r)); }
  };

  const deleteReminder = async (id: string) => {
    await api.delete(`/api/reminders/${id}`);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addApp = async (app: Omit<AppItem, 'id' | 'category' | 'description'>) => {
    const newApp = await api.post('/api/apps', app);
    setApps(prev => [...prev, newApp]);
  };

  const updateSiteTheme = async (themeUpdate: Partial<SiteTheme>) => {
    const originalTheme = { ...siteTheme };
    setSiteTheme(prev => ({ ...prev, ...themeUpdate }));
    try { await api.put('/api/theme', themeUpdate); }
    catch (error) { setSiteTheme(originalTheme); }
  };

  const contextValue: DataContextType = {
    user, allUsers, blogs, photos, apps, reminders, homeSections, siteTheme, isLoading,
    login, logout, addUser, changePassword, updateUserAvatar, addBlog, updateBlog, deleteBlog, likeBlog, collectBlog, commentBlog,
    addPhoto, likePhoto, collectPhoto, commentPhoto,
    addReminder, toggleReminder, deleteReminder, addApp, updateSiteTheme,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};