import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BlogPost, Photo, AppItem, User, Reminder } from '../types';
import { MOCK_BLOGS, MOCK_PHOTOS, MOCK_APPS, CURRENT_USER, ALL_USERS, MOCK_REMINDERS } from '../constants';

interface DataContextType {
  user: User;
  allUsers: User[];
  blogs: BlogPost[];
  photos: Photo[];
  apps: AppItem[];
  reminders: Reminder[];
  switchUser: (userId: string) => void;
  addBlog: (post: BlogPost) => void;
  deleteBlog: (id: string) => void;
  likeBlog: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  addApp: (app: AppItem) => void;
  addReminder: (text: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [blogs, setBlogs] = useState<BlogPost[]>(MOCK_BLOGS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);

  const switchUser = (userId: string) => {
    const newUser = ALL_USERS.find(u => u.id === userId);
    if (newUser) {
      setUser(newUser);
    }
  };

  const addBlog = (post: BlogPost) => {
    setBlogs([post, ...blogs]);
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

  return (
    <DataContext.Provider value={{ 
      user, 
      allUsers: ALL_USERS,
      blogs, 
      photos, 
      apps, 
      reminders,
      switchUser,
      addBlog, 
      deleteBlog, 
      likeBlog, 
      addPhoto, 
      addApp,
      addReminder,
      toggleReminder,
      deleteReminder
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