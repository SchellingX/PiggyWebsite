
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member' | 'guest';
  password?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
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
  isCollected: boolean;
  image?: string;
  comments: Comment[];
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  date: string;
  takenBy: string;
  source?: 'local' | 'mount';
  mediaType?: 'image' | 'video';
  likes: number;
  isCollected: boolean;
  comments: Comment[];
}

export interface AppItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  url?: string;
}

export interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
  source?: 'local' | 'cloud' | 'outlook' | 'apple';
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

export interface SiteTheme {
  mainBg: string;
  loginBg: string;
  homeBanner: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserChatData {
  userId: string;
  sessions: ChatSession[];
}
