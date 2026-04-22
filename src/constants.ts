import { Heart, Baby, Users, Home, Smile, Star, Sun, Moon, Cloud, Ghost, Crown, Gift } from 'lucide-react';

export const EVOLUTION_LEVELS = [
  { level: 1, name: 'Sơ Sinh', radius: 15, color: '#FFEBEE', icon: 'Baby', points: 2, image: '/assets/images/family_1.png' },
  { level: 2, name: 'Tập Đi', radius: 22, color: '#FCE4EC', icon: 'Smile', points: 4, image: '/assets/images/family_2.png' },
  { level: 3, name: 'Mầm Non', radius: 30, color: '#F3E5F5', icon: 'Cloud', points: 8, image: '/assets/images/family_3.png' },
  { level: 4, name: 'Tiểu Học', radius: 40, color: '#EDE7F6', icon: 'Sun', points: 16, image: '/assets/images/family_4.png' },
  { level: 5, name: 'Thiếu Niên', radius: 52, color: '#E8EAF6', icon: 'Moon', points: 32, image: '/assets/images/family_5.png' },
  { level: 6, name: 'Thanh Niên', radius: 66, color: '#E3F2FD', icon: 'Star', points: 64, image: '/assets/images/family_6.png' },
  { level: 7, name: 'Trưởng Thành', radius: 82, color: '#E1F5FE', icon: 'Gift', points: 128, image: '/assets/images/family_7.png' },
  { level: 8, name: 'Kết Hôn', radius: 100, color: '#E0F2F1', icon: 'Heart', points: 256, image: '/assets/images/family_8.png' },
  { level: 9, name: 'Cha Mẹ', radius: 120, color: '#E8F5E9', icon: 'Users', points: 512, image: '/assets/images/family_9.png' },
  { level: 10, name: 'Ông Bà', radius: 142, color: '#F1F8E9', icon: 'Home', points: 1024, image: '/assets/images/family_10.png' },
  { level: 11, name: 'Đại Gia Đình', radius: 168, color: '#FFF3E0', icon: 'Crown', points: 2048, image: '/assets/images/family_11.png' },
  { level: 12, name: 'Kỷ Niệm Vĩnh Cửu', radius: 200, color: '#FBE9E7', icon: 'Ghost', points: 4096, image: '/assets/images/family_12.png' },
];

export const ICON_MAP = {
  Baby, Smile, Cloud, Sun, Moon, Star, Gift, Heart, Users, Home, Crown, Ghost
};
