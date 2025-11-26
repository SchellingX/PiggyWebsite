import { AppItem, BlogPost, Photo, User, Reminder } from './types';

export const ALL_USERS: User[] = [
  {
    id: 'u1',
    name: '猪爸爸',
    avatar: 'https://picsum.photos/id/64/100/100',
    role: 'admin',
  },
  {
    id: 'u2',
    name: '佩奇',
    avatar: 'https://picsum.photos/id/65/100/100',
    role: 'member',
  },
  {
    id: 'u3',
    name: '克洛伊堂姐',
    avatar: 'https://picsum.photos/id/66/100/100',
    role: 'guest',
  }
];

export const CURRENT_USER: User = ALL_USERS[0];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: '周日山丘野餐',
    excerpt: '我们度过了一段美好的时光，吃三明治，玩飞盘。',
    content: '天气非常完美。佩奇很喜欢巧克力蛋糕。乔治在草丛里发现了一个恐龙玩具。这对全家人来说都是美好的一天。',
    author: ALL_USERS[0],
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['家庭', '野餐', '美食'],
    likes: 12,
    image: 'https://picsum.photos/id/28/800/400',
    comments: [
      { id: 'c1', author: '猪妈妈', text: '蛋糕真好吃！', date: new Date().toISOString() }
    ]
  },
  {
    id: 'b2',
    title: '乔治的恐龙收藏',
    excerpt: '这是对他新收藏品的概览。',
    content: '乔治又有了一个新的霸王龙。它非常绿，非常吓人。吼！',
    author: { ...ALL_USERS[0], name: '佩奇' }, // Keeping Peppa as author name but using User object structure
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['玩具', '乔治'],
    likes: 8,
    image: 'https://picsum.photos/id/56/800/400',
    comments: []
  }
];

export const MOCK_PHOTOS: Photo[] = [
  {
    id: 'p1',
    url: 'https://picsum.photos/id/10/800/800',
    caption: '森林日落',
    category: '旅行',
    date: '2023-10-01',
    takenBy: '猪妈妈'
  },
  {
    id: 'p2',
    url: 'https://picsum.photos/id/12/800/800',
    caption: '海滩日！',
    category: '活动',
    date: '2023-09-15',
    takenBy: '猪爸爸'
  },
  {
    id: 'p3',
    url: 'https://picsum.photos/id/22/800/800',
    caption: '独自散步',
    category: '日常',
    date: '2023-11-20',
    takenBy: '佩奇'
  },
  {
    id: 'p4',
    url: 'https://picsum.photos/id/43/800/800',
    caption: '踩泥坑',
    category: '有趣',
    date: '2023-12-05',
    takenBy: '乔治'
  },
   {
    id: 'p5',
    url: 'https://picsum.photos/id/55/800/800',
    caption: '花园',
    category: '日常',
    date: '2023-12-10',
    takenBy: '猪奶奶'
  }
];

export const MOCK_APPS: AppItem[] = [
  { id: 'a1', name: '日历', icon: 'Calendar', category: '工具', description: '家庭活动和生日', url: '#' },
  { id: 'a2', name: '购物清单', icon: 'ShoppingCart', category: '工具', description: '需要买的杂货', url: '#' },
  { id: 'a3', name: '财务', icon: 'CreditCard', category: '财务', description: '存钱罐状态', url: '#' },
  { id: 'a4', name: '食谱', icon: 'Utensils', category: '生活', description: '猪妈妈的秘制食谱', url: '#' },
  { id: 'a5', name: '学校', icon: 'BookOpen', category: '教育', description: '游戏组课程表', url: '#' },
  { id: 'app-reminders', name: '提醒事项', icon: 'ListTodo', category: '工具', description: '待办事项清单', url: '#' },
];

export const MOCK_REMINDERS: Reminder[] = [
  { id: 'r1', text: '去超市买牛奶', completed: false },
  { id: 'r2', text: '给金鱼喂食', completed: true },
  { id: 'r3', text: '归还图书馆的书', completed: false },
];