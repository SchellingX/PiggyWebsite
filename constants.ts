
import { AppItem, BlogPost, Photo, User, Reminder, SiteTheme } from './types';

// Use local assets from public/assets folder
const ASSETS = {
  avatarDefault: '/assets/avatar-default.png',
  slide1: '/assets/slide1.jpg',
  slide2: '/assets/slide2.jpg',
  slide3: '/assets/slide3.jpg',
  bgMain: '/assets/bg-main.jpg',
  bgLogin: '/assets/bg-login.jpg',
};

export const DEFAULT_SITE_THEME: SiteTheme = {
  mainBg: ASSETS.bgMain,
  loginBg: ASSETS.bgLogin,
  homeBanner: ASSETS.slide1, // Default banner
};

export const ALL_USERS: User[] = [
  {
    id: 'u_admin',
    name: '猪管',
    avatar: ASSETS.avatarDefault,
    role: 'admin',
    password: '123456',
  },
  {
    id: 'u_dad',
    name: '爸比',
    avatar: ASSETS.avatarDefault,
    role: 'member',
    password: '123456',
  },
  {
    id: 'u_mom',
    name: '妈咪',
    avatar: ASSETS.avatarDefault,
    role: 'member',
    password: '123456',
  },
  {
    id: 'u_grandma',
    name: '婆婆',
    avatar: ASSETS.avatarDefault,
    role: 'member',
    password: '123456',
  },
  {
    id: 'u_fan',
    name: '猪迷',
    avatar: ASSETS.avatarDefault,
    role: 'guest',
    password: '123456',
  }
];

export const CURRENT_USER: User = ALL_USERS[0];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: '周日山丘野餐',
    excerpt: '我们度过了一段美好的时光，吃三明治，玩飞盘。',
    content: '天气非常完美。圆圆很喜欢巧克力蛋糕。圆圆在草丛里发现了一个恐龙玩具。这对全家人来说都是美好的一天。',
    author: ALL_USERS[1],
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['家庭', '野餐', '美食'],
    likes: 12,
    isCollected: false,
    image: ASSETS.slide1,
    comments: [
      { id: 'c1', author: '妈咪', text: '蛋糕真好吃！', date: new Date().toISOString() }
    ]
  },
  {
    id: 'b2',
    title: '圆圆的小汽车收藏',
    excerpt: '这是对她新收藏品的概览。',
    content: '圆圆又有了一个新的小汽车。它非常大，速度非常快。咻！',
    author: ALL_USERS[2],
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['玩具', '圆圆'],
    likes: 8,
    isCollected: true,
    image: ASSETS.slide2,
    comments: []
  }
];

export const MOCK_PHOTOS: Photo[] = [
  {
    id: 'p1',
    url: ASSETS.slide1,
    caption: '森林日落',
    category: '旅行',
    date: '2023-10-01',
    takenBy: '妈咪',
    source: 'local',
    likes: 5,
    isCollected: false,
    comments: []
  },
  {
    id: 'p2',
    url: ASSETS.slide2,
    caption: '海滩日！',
    category: '活动',
    date: '2023-09-15',
    takenBy: '爸比',
    source: 'local',
    likes: 10,
    isCollected: true,
    comments: [
        { id: 'pc1', author: '圆圆', text: '好玩！', date: new Date().toISOString() }
    ]
  },
  {
    id: 'p3',
    url: ASSETS.slide3,
    caption: '独自散步',
    category: '日常',
    date: '2023-11-20',
    takenBy: '圆圆',
    source: 'local',
    likes: 2,
    isCollected: false,
    comments: []
  }
];

export const MOCK_APPS: AppItem[] = [
  { id: 'a1', name: '日历', icon: 'Calendar', category: '工具', description: '家庭活动和生日', url: '#' },
  { id: 'a2', name: '购物清单', icon: 'ShoppingCart', category: '工具', description: '需要买的杂货', url: '#' },
  { id: 'a3', name: '财务', icon: 'CreditCard', category: '财务', description: '存钱罐状态', url: '#' },
  { id: 'a4', name: '食谱', icon: 'Utensils', category: '生活', description: '妈咪的秘制食谱', url: '#' },
  { id: 'a5', name: '学校', icon: 'BookOpen', category: '教育', description: '游戏组课程表', url: '#' },
  { id: 'app-reminders', name: '提醒事项', icon: 'ListTodo', category: '工具', description: '待办事项清单', url: '#' },
];

export const MOCK_REMINDERS: Reminder[] = [
  { id: 'r1', text: '去超市买牛奶', completed: false },
  { id: 'r2', text: '给金鱼喂食', completed: true },
  { id: 'r3', text: '归还图书馆的书', completed: false },
  { id: 'r4', text: '帮圆圆修小汽车', completed: false },
];
