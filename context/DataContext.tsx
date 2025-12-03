
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { BlogPost, Photo, AppItem, User, Reminder, HomeSection } from '../types';
import { MOCK_BLOGS, MOCK_PHOTOS, MOCK_APPS, ALL_USERS, MOCK_REMINDERS } from '../constants';

interface DataContextType {
  user: User | null;
  allUsers: User[];
  blogs: BlogPost[];
  photos: Photo[];
  apps: AppItem[];
  reminders: Reminder[];
  homeSections: HomeSection[];
  isHomeEditing: boolean;
  isLoading: boolean;
  login: (name: string, password: string) => boolean;
  logout: () => void;
  resetUserPassword: (name: string, newPass: string) => boolean;
  changePassword: (newPass: string) => void;
  updateUserAvatar: (newAvatar: string) => void;
  addUser: (name: string, avatar: string, password: string) => void;
  addBlog: (post: BlogPost) => void;
  updateBlog: (post: BlogPost) => void;
  deleteBlog: (id: string) => void;
  likeBlog: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  addApp: (app: AppItem) => void;
  addReminder: (text: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  toggleHomeEditing: () => void;
  updateHomeSections: (sections: HomeSection[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEFAULT_SECTIONS: HomeSection[] = [
  { id: 'carousel', type: 'carousel', visible: true, title: '轮播图' },
  { id: 'apps', type: 'apps', visible: true, title: '快速应用' },
  { id: 'blogs', type: 'blogs', visible: true, title: '最新博客' },
  { id: 'notices', type: 'notices', visible: true, title: '家庭公告栏' },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial Mock State (used as fallback or initial value before fetch)
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_USERS);
  const [blogs, setBlogs] = useState<BlogPost[]>(MOCK_BLOGS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  const [homeSections, setHomeSections] = useState<HomeSection[]>(DEFAULT_SECTIONS);
  
  const [isHomeEditing, setIsHomeEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialized = useRef(false);

  // --- Backend Persistence Logic ---

  // 1. Load Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          
          if (data.initialized === false) {
             // Server has no data, use MOCK data and trigger a save
             console.log("Initialize server with mock data");
             saveToBackend({ allUsers, blogs, photos, apps, reminders, homeSections });
          } else {
             // Server has data, update state
             if (data.allUsers) setAllUsers(data.allUsers);
             if (data.blogs) setBlogs(data.blogs);
             if (data.photos) setPhotos(data.photos);
             if (data.apps) setApps(data.apps);
             if (data.reminders) setReminders(data.reminders);
             if (data.homeSections) setHomeSections(data.homeSections);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data from backend, using local mock.", error);
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Save Data Helper
  const saveToBackend = async (data: any) => {
      try {
          await fetch('/api/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
      } catch (error) {
          console.error("Failed to save data to backend", error);
      }
  };

  // 3. Effect to auto-save whenever core data changes
  // We use a ref to prevent saving during initial load phase
  useEffect(() => {
      if (!isInitialized.current) return;

      const timer = setTimeout(() => {
          saveToBackend({
              allUsers,
              blogs,
              photos,
              apps,
              reminders,
              homeSections
          });
      }, 1000); // Debounce save by 1 second

      return () => clearTimeout(timer);
  }, [allUsers, blogs, photos, apps, reminders, homeSections]);


  // --- Actions ---

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
    setIsHomeEditing(false);
  };

  const addUser = (name: string, avatar: string, password: string) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      avatar,
      role: 'member', 
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

  const addPhoto = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev]);
  };

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