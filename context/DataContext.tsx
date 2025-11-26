import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BlogPost, Photo, AppItem, User } from '../types';
import { MOCK_BLOGS, MOCK_PHOTOS, MOCK_APPS, CURRENT_USER } from '../constants';

interface DataContextType {
  user: User;
  blogs: BlogPost[];
  photos: Photo[];
  apps: AppItem[];
  addBlog: (post: BlogPost) => void;
  deleteBlog: (id: string) => void;
  likeBlog: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  addApp: (app: AppItem) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<User>(CURRENT_USER);
  const [blogs, setBlogs] = useState<BlogPost[]>(MOCK_BLOGS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);

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

  return (
    <DataContext.Provider value={{ user, blogs, photos, apps, addBlog, deleteBlog, likeBlog, addPhoto, addApp }}>
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
