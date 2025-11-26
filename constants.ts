import { AppItem, BlogPost, Photo, User } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Daddy Pig',
  avatar: 'https://picsum.photos/id/64/100/100',
  role: 'admin',
};

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Sunday Picnic at the Hill',
    excerpt: 'We had a wonderful time eating sandwiches and playing frisbee.',
    content: 'The weather was perfect. Peppa loved the chocolate cake. George found a dinosaur toy in the grass. It was a splendid day for the whole family.',
    author: CURRENT_USER,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['Family', 'Picnic', 'Food'],
    likes: 12,
    image: 'https://picsum.photos/id/28/800/400',
    comments: [
      { id: 'c1', author: 'Mummy Pig', text: 'The cake was delicious!', date: new Date().toISOString() }
    ]
  },
  {
    id: 'b2',
    title: 'George\'s Dinosaur Collection',
    excerpt: 'An overview of the new additions to the collection.',
    content: 'George has acquired a new T-Rex. It is very green and very scary. Roar!',
    author: { ...CURRENT_USER, name: 'Peppa' },
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['Toys', 'George'],
    likes: 8,
    image: 'https://picsum.photos/id/56/800/400',
    comments: []
  }
];

export const MOCK_PHOTOS: Photo[] = [
  {
    id: 'p1',
    url: 'https://picsum.photos/id/10/800/800',
    caption: 'Sunset at the forest',
    category: 'Travel',
    date: '2023-10-01',
    takenBy: 'Mummy Pig'
  },
  {
    id: 'p2',
    url: 'https://picsum.photos/id/12/800/800',
    caption: 'Beach Day!',
    category: 'Event',
    date: '2023-09-15',
    takenBy: 'Daddy Pig'
  },
  {
    id: 'p3',
    url: 'https://picsum.photos/id/22/800/800',
    caption: 'Walking alone',
    category: 'Daily',
    date: '2023-11-20',
    takenBy: 'Peppa'
  },
  {
    id: 'p4',
    url: 'https://picsum.photos/id/43/800/800',
    caption: 'Muddy Puddles',
    category: 'Funny',
    date: '2023-12-05',
    takenBy: 'George'
  },
   {
    id: 'p5',
    url: 'https://picsum.photos/id/55/800/800',
    caption: 'The Garden',
    category: 'Daily',
    date: '2023-12-10',
    takenBy: 'Granny Pig'
  }
];

export const MOCK_APPS: AppItem[] = [
  { id: 'a1', name: 'Calendar', icon: 'Calendar', category: 'Utility', description: 'Family events and birthdays', url: '#' },
  { id: 'a2', name: 'Shopping List', icon: 'ShoppingCart', category: 'Utility', description: 'Groceries needed', url: '#' },
  { id: 'a3', name: 'Finances', icon: 'CreditCard', category: 'Finance', description: 'Piggy bank status', url: '#' },
  { id: 'a4', name: 'Recipes', icon: 'Utensils', category: 'Lifestyle', description: 'Mummy Pig\'s secret recipes', url: '#' },
  { id: 'a5', name: 'School', icon: 'BookOpen', category: 'Education', description: 'Playgroup schedules', url: '#' },
  { id: 'a6', name: 'Contacts', icon: 'Phone', category: 'Utility', description: 'Emergency numbers', url: '#' },
];
