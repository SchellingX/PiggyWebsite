import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BlogPost, Photo, AppItem, User, Reminder, HomeSection } from '../types';
import { MOCK_BLOGS, MOCK_PHOTOS, MOCK_APPS, CURRENT_USER, ALL_USERS, MOCK_REMINDERS } from '../constants';

interface DataContextType {
  user: User;
  allUsers: User[];
  blogs: BlogPost[];
  photos: Photo[];
  apps: AppItem[];
  reminders: Reminder[];
  homeSections: HomeSection[];
  isHomeEditing: boolean;
  switchUser: (userId: string) => void;
  addUser: (name: string, avatar: string) => void;
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
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [allUsers, setAllUsers] = useState<User[]>(ALL_USERS);
  const [blogs, setBlogs] = useState<BlogPost[]>(MOCK_BLOGS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);
  
  // Home Page Layout State
  const [homeSections, setHomeSections] = useState<HomeSection[]>(DEFAULT_SECTIONS);
  const [isHomeEditing, setIsHomeEditing] = useState(false);

  const switchUser = (userId: string) => {
    const newUser = allUsers.find(u => u.id === userId);
    if (newUser) {
      setUser(newUser);
    }
  };

  const addUser = (name: string, avatar: string) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      avatar,
      role: 'member',
    };
    setAllUsers([...allUsers, newUser]);
  };

  const addBlog = (post: BlogPost) => {
    setBlogs([post, ...blogs]);
  };

  const updateBlog = (updatedPost: BlogPost) => {
    setBlogs(blogs.map(b => b.id === updatedPost.id ? updatedPost : b));
  };

  const deleteBlog = (id: string) => {
    setBlogs(blogs.filter(b => b.id !== id));
  };

  const likeBlog = (id: string) => {
    setBlogs(blogs.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
  };

  const addPhoto = (photo: Photo) => {
    setPhotos([photo, ...photos]);
  };

  const addApp = (app: AppItem) => {
    setApps([...apps, app]);
  };

  const addReminder = (text: string) => {
    setReminders([...reminders, { id: Date.now().toString(), text, completed: false }]);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
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
      switchUser,
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