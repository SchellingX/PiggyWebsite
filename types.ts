
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member' | 'guest';
  password?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: User;
  date: string; // ISO string
  tags: string[];
  likes: number;
  image?: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  takenBy: string;
  source?: 'local' | 'mount';
}

export interface AppItem {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  category: string;
  description: string;
  url?: string;
}

export interface Reminder {
  id: string;
  text: string;
  completed: boolean;
}

export type SearchSource = 'local' | 'ai';

export interface SearchResult {
  id: string;
  type: 'blog' | 'photo' | 'app';
  title: string;
  description: string;
  link: string;
}

export interface HomeSection {
  id: string;
  type: 'carousel' | 'apps' | 'blogs' | 'notices';
  visible: boolean;
  title: string;
}
