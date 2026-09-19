export type Meetup = {
  id: string;
  title: string;
  category: string;
  area: string;
  venue: string;
  dateLabel: string;
  time: string;
  distance: string;
  members: number;
  capacity: number;
  host: string;
  hostVerified: boolean;
  ageRange: string;
  language: string;
  payment: string;
  vibe: string;
  description: string;
  color: string;
  tags: string[];
};

export const MEETUPS: Meetup[] = [
  {
    id: 'startup-chill',
    title: 'Startup & chill',
    category: 'Networking',
    area: 'Quận 1',
    venue: 'The Workshop Coffee',
    dateLabel: 'Tối nay',
    time: '19:30',
    distance: '1,2 km',
    members: 4,
    capacity: 6,
    host: 'Minh Anh',
    hostVerified: true,
    ageRange: '23–30 tuổi',
    language: 'Tiếng Việt · English',
    payment: 'Mỗi người tự trả',
    vibe: 'Nói chuyện nhẹ nhàng',
    description: 'Một buổi trò chuyện nhỏ cho người làm sản phẩm, công nghệ và startup. Không cần uống đồ có cồn.',
    color: '#F28C28',
    tags: ['Chill', 'Rooftop', 'Networking'],
  },
  {
    id: 'boardgame-weekend',
    title: 'Board game cuối tuần',
    category: 'Board game',
    area: 'Bình Thạnh',
    venue: 'Meeple House',
    dateLabel: 'Thứ Bảy',
    time: '18:00',
    distance: '3,4 km',
    members: 5,
    capacity: 8,
    host: 'Tuấn Nguyễn',
    hostVerified: true,
    ageRange: '20–32 tuổi',
    language: 'Tiếng Việt',
    payment: 'Chia đều',
    vibe: 'Vui vẻ · người mới thân thiện',
    description: 'Chơi Codenames, Avalon và vài game nhẹ. Nhóm luôn dành thời gian hướng dẫn người mới.',
    color: '#F4B400',
    tags: ['Board game', 'Nhóm nhỏ', 'Người mới'],
  },
  {
    id: 'karaoke-friday',
    title: 'Karaoke không áp lực',
    category: 'Karaoke',
    area: 'Quận 3',
    venue: 'Nnice Võ Văn Tần',
    dateLabel: 'Thứ Sáu',
    time: '20:00',
    distance: '2,1 km',
    members: 3,
    capacity: 6,
    host: 'Lan Chi',
    hostVerified: false,
    ageRange: '22–35 tuổi',
    language: 'Tiếng Việt',
    payment: 'Chia đều',
    vibe: 'Thân thiện · không chấm giọng hát',
    description: 'Đi hát và làm quen bạn mới. Có đồ uống không cồn, tôn trọng lựa chọn của mọi người.',
    color: '#D97733',
    tags: ['Karaoke', 'Vui vẻ', 'Không áp lực'],
  },
];

export const CATEGORIES = ['Tất cả', 'Tối nay', 'Gần đây', 'Karaoke', 'Chill', 'Rooftop', '2–4 người'];
