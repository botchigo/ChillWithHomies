export type UserSummary = {
  id: string;
  name: string;
  username: string;
  avatarColor: string;
  avatarUri?: string;
  verified?: boolean;
};

export type UserProfile = UserSummary & {
  phone: string;
  bio: string;
  city: string;
  interests: string[];
  dateOfBirth: string;
  verifiedPhone: boolean;
  preferredVibes: string[];
};

export type DemoUser = UserSummary & {
  bio: string;
  city: string;
  interests: string[];
  friendIds: string[];
  reliabilityScore?: number;
  completedKeos?: number;
  noShowCount?: number;
};

export type MeetupStatus = 'upcoming' | 'ongoing' | 'ended';

export type AlcoholType = 'Bia hơi' | 'Bia craft' | 'Rượu' | 'Cocktail' | 'Không cồn' | 'Mix';

export type MenuItem = { name: string; price: number };

export type BillShare = { userId: string; amount: number; paid: boolean; checkedIn?: boolean };

export type Meetup = {
  id: string;
  title: string;
  category: string;
  date: string;
  dateLabel: string;
  time: string;
  location: string;
  district: string;
  distanceKm: number;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  hostAvatarColor: string;
  hostAvatarUri?: string;
  hostVerified: boolean;
  participants: UserSummary[];
  maxParticipants: number;
  vibe: string[];
  paymentType: string;
  description: string;
  status: MeetupStatus;
  isPublic: boolean;
  image: 'rooftop' | 'coffee' | 'games' | 'karaoke' | 'dinner' | 'running' | 'workshop';
  color: string;
  alcoholType?: AlcoholType | string;
  menuItems?: MenuItem[];
  billNote?: string;
  drinkLimit?: string;
  age18Plus?: boolean;
  mapQuery?: string;
  tableBooked?: boolean;
  depositAmount?: number;
  billTotal?: number;
  billShares?: BillShare[];
  checkedInIds?: string[];
};

export type PollOption = { id: string; label: string; voterIds: string[] };
export type MessageType = 'text' | 'location' | 'eta' | 'poll' | 'system';
export type ChatMessage = {
  id: string;
  type: MessageType;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  location?: { name: string; address: string };
  poll?: { question: string; options: PollOption[] };
};

export type ChatRoom = {
  meetupId: string;
  unread: number;
  onlineCount: number;
  messages: ChatMessage[];
};

export type Review = { id: string; author: string; rating: number; date: string; text: string };
export type BlockedUser = UserSummary;
export type NotificationType = 'friend_request' | 'friend_accepted' | 'meetup' | 'chat';
export type DemoNotification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  userId?: string;
  meetupId?: string;
};

export type DemoAppState = {
  version: 3;
  currentUser: UserProfile | null;
  profile: UserProfile;
  meetups: Meetup[];
  chats: ChatRoom[];
  reviews: Review[];
  users: DemoUser[];
  friendIds: string[];
  sentFriendRequestIds: string[];
  receivedFriendRequestIds: string[];
  blockedUsers: BlockedUser[];
  notifications: DemoNotification[];
  notificationsEnabled: boolean;
};

export type MeetupDraft = {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  district?: string;
  maxParticipants: number;
  paymentType: string;
  vibe: string[];
  description: string;
  isPublic: boolean;
  alcoholType?: string;
  menuNote?: string;
  billNote?: string;
  drinkLimit?: string;
  ageConfirm?: boolean;
  depositAmount?: number;
};

export const ALCOHOL_TYPES = ['Bia hơi', 'Bia craft', 'Rượu', 'Cocktail', 'Không cồn', 'Mix'] as const;
export const BILL_SPLITS = ['Chia đều (Campuchia)', 'Mỗi người tự trả', 'Host mời', 'Chia theo món', 'Thống nhất tại quán'] as const;
export const DRINK_LIMITS = ['Vui là chính', 'Tối đa 3 lon', 'Tối đa 5 lon', 'Không ép uống', 'Tự lượng sức'] as const;
export const NHAU_CATEGORIES = ['Nhậu', 'Bia', 'Quán ốc', 'Lẩu nướng', 'Rooftop bia', 'Ăn uống', 'Café', 'Board game', 'Karaoke', 'Networking', 'Khác'] as const;
export const NHAU_SAFETY_TIPS = [
  'Chỉ 18+ mới tham gia kèo có cồn.',
  'Gặp ở quán công cộng, đông người.',
  'Đã uống thì không lái xe — đặt Grab về.',
  'Không ép uống, tôn trọng người uống không cồn.',
] as const;

export const DEPOSIT_OPTIONS = [0, 30000, 50000, 100000] as const;

export const FILTERS = ['Tất cả', 'Tối nay', 'Gần đây', 'Nhậu', 'Bia', 'Rooftop', 'Quán ốc', 'Chill', '2–4 người'] as const;
export type MeetupFilter = (typeof FILTERS)[number];
export type MeetupSort = 'Gần nhất' | 'Sắp diễn ra' | 'Còn nhiều chỗ';

const people: Record<string, UserSummary> = {
  minh: { id: 'user-minh-anh', name: 'Minh Anh', username: 'minhanh', avatarColor: '#F28C28', verified: true },
  lan: { id: 'user-lan-chi', name: 'Lan Chi', username: 'lanchi', avatarColor: '#E88F9C', verified: true },
  tuan: { id: 'user-tuan-nguyen', name: 'Tuấn Nguyễn', username: 'tuannguyen', avatarColor: '#7C9A65', verified: true },
  nam: { id: 'user-hoang-nam', name: 'Hoàng Nam', username: 'hoangnam', avatarColor: '#668CB8', verified: true },
  ngoc: { id: 'user-ngoc-anh', name: 'Ngọc Anh', username: 'ngocanh', avatarColor: '#B583A7', verified: false },
  huy: { id: 'user-gia-huy', name: 'Gia Huy', username: 'giahuy', avatarColor: '#B8864F', verified: false },
  mai: { id: 'user-mai-phuong', name: 'Mai Phương', username: 'maiphuong', avatarColor: '#D07A72', verified: true },
};

function localIso(daysFromNow: number) {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + daysFromNow);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function at(daysFromNow: number, hour: number, minute: number) {
  const value = new Date();
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysUntilWeekday(target: number) {
  const diff = (target - new Date().getDay() + 7) % 7;
  return diff === 0 ? 7 : diff;
}

function labelForOffset(daysFromNow: number) {
  if (daysFromNow === 0) return 'Tối nay';
  if (daysFromNow === 1) return 'Ngày mai';
  const value = new Date();
  value.setDate(value.getDate() + daysFromNow);
  return value.toLocaleDateString('vi-VN', { weekday: 'long' });
}

function message(id: string, sender: UserSummary, text: string, createdAt: string): ChatMessage {
  return { id, type: 'text', senderId: sender.id, senderName: sender.name, text, createdAt };
}

export function createSeedState(): DemoAppState {
  const friday = daysUntilWeekday(5);
  const saturday = daysUntilWeekday(6);
  const sunday = daysUntilWeekday(0);
  const profile: UserProfile = {
    ...people.minh,
    phone: '0901234567',
    bio: 'Thích rooftop bia, quán ốc vỉa hè và nhóm nhỏ nói chuyện thật lòng. Uống có trách nhiệm.',
    city: 'TP. Hồ Chí Minh',
    interests: ['Nhậu', 'Bia', 'Rooftop', 'Quán ốc', 'Nhóm nhỏ', 'Karaoke'],
    dateOfBirth: '05-18-1997',
    verifiedPhone: true,
    preferredVibes: ['Chill', 'Nhóm nhỏ', 'Vui vẻ'],
  };
  const users: DemoUser[] = [
    { ...people.minh, bio: profile.bio, city: profile.city, interests: profile.interests, friendIds: [people.lan.id, people.tuan.id], reliabilityScore: 98, completedKeos: 24, noShowCount: 0 },
    { ...people.lan, bio: 'Mê rooftop bia và quán ốc, không ép uống.', city: 'TP. Hồ Chí Minh', interests: ['Nhậu', 'Bia', 'Rooftop', 'Karaoke'], friendIds: [people.minh.id, people.tuan.id, people.mai.id], reliabilityScore: 96, completedKeos: 19, noShowCount: 1 },
    { ...people.tuan, bio: 'Team bia craft, thích lai rai và board game.', city: 'TP. Hồ Chí Minh', interests: ['Bia', 'Nhậu', 'Board game'], friendIds: [people.minh.id, people.lan.id], reliabilityScore: 92, completedKeos: 15, noShowCount: 1 },
    { ...people.nam, bio: 'Rooftop ngắm hoàng hôn, 2-3 lon là vui.', city: 'TP. Thủ Đức', interests: ['Rooftop', 'Bia', 'Chill'], friendIds: [people.lan.id, people.mai.id], reliabilityScore: 88, completedKeos: 11, noShowCount: 2 },
    { ...people.ngoc, bio: 'Uống không cồn vẫn chill, mê quán ốc.', city: 'TP. Hồ Chí Minh', interests: ['Quán ốc', 'Không cồn', 'Nhóm nhỏ'], friendIds: [people.lan.id], reliabilityScore: 99, completedKeos: 17, noShowCount: 0 },
    { ...people.huy, bio: 'Thích khám phá quán nhậu và lẩu bò.', city: 'TP. Hồ Chí Minh', interests: ['Nhậu', 'Lẩu nướng'], friendIds: [], reliabilityScore: 65, completedKeos: 4, noShowCount: 3 },
    { ...people.mai, bio: 'Rủ kèo bia craft cuối tuần, ai cũng welcome.', city: 'TP. Hồ Chí Minh', interests: ['Bia', 'Nhậu', 'Rooftop'], friendIds: [people.lan.id, people.nam.id], reliabilityScore: 94, completedKeos: 13, noShowCount: 0 },
  ];
  const meetups: Meetup[] = [
    {
      id: 'nhau-rooftop-toi-nay', title: 'Rooftop bia sau giờ làm', category: 'Rooftop bia', date: localIso(0), dateLabel: 'Tối nay', time: '19:30',
      location: 'Chạng Vạng Rooftop', district: 'Bình Thạnh', distanceKm: 1.2, hostId: people.minh.id, hostName: people.minh.name,
      hostAvatar: 'profile-minh-anh', hostAvatarColor: people.minh.avatarColor, hostVerified: true,
      participants: [people.minh, people.lan, people.nam, people.ngoc], maxParticipants: 6,
      vibe: ['Chill', 'Rooftop', 'Nhậu'], paymentType: 'Chia đều (Campuchia)',
      description: 'Lai rai 2-3 lon ngắm Sài Gòn lên đèn. Có option không cồn, không ép uống. Ai say thì đặt Grab về chung.',
      status: 'upcoming', isPublic: true, image: 'rooftop', color: '#F28C28',
      alcoholType: 'Bia hơi', menuItems: [{ name: 'Bia hơi', price: 25000 }, { name: 'Mồi lai rai', price: 89000 }],
      billNote: 'Campuchia tại bàn, khoảng 120k/người.', drinkLimit: 'Tự lượng sức', age18Plus: true,
      mapQuery: 'Chạng Vạng Rooftop Bình Thạnh', tableBooked: true,
      depositAmount: 50000, billTotal: 680000,
      billShares: [
        { userId: people.minh.id, amount: 170000, paid: true, checkedIn: true },
        { userId: people.lan.id, amount: 170000, paid: true, checkedIn: true },
        { userId: people.nam.id, amount: 170000, paid: false, checkedIn: true },
        { userId: people.ngoc.id, amount: 170000, paid: false, checkedIn: false },
      ],
      checkedInIds: [people.minh.id, people.lan.id, people.nam.id],
    },
    {
      id: 'quan-oc-quan-1', title: 'Quán ốc vỉa hè Quận 1', category: 'Quán ốc', date: localIso(0), dateLabel: 'Tối nay', time: '18:30',
      location: 'Ốc Đào Nguyễn Trãi', district: 'Quận 1', distanceKm: 0.8, hostId: people.ngoc.id, hostName: people.ngoc.name,
      hostAvatar: 'ngoc', hostAvatarColor: people.ngoc.avatarColor, hostVerified: false,
      participants: [people.ngoc, people.lan], maxParticipants: 4,
      vibe: ['Nhậu', 'Quán ốc', 'Nhóm nhỏ'], paymentType: 'Chia theo món',
      description: 'Team ốc len xào dừa + nghêu hấp sả. Mỗi người gọi 1-2 món share cả bàn. Quán đông vui, dễ bắt chuyện.',
      status: 'upcoming', isPublic: true, image: 'dinner', color: '#C86D46',
      alcoholType: 'Bia hơi', menuItems: [{ name: 'Ốc len xào dừa', price: 95000 }, { name: 'Nghêu hấp sả', price: 75000 }, { name: 'Bia Tiger', price: 23000 }],
      billNote: 'Ai gọi món nào note lại, share tiền mồi + bia riêng.', drinkLimit: 'Không ép uống', age18Plus: true,
      mapQuery: 'Ốc Đào Nguyễn Trãi Quận 1', tableBooked: false,
      depositAmount: 30000, checkedInIds: [],
    },
    {
      id: 'bia-craft-thao-dien', title: 'Bia craft Thảo Điền', category: 'Bia', date: localIso(1), dateLabel: 'Ngày mai', time: '19:00',
      location: 'Heart of Darkness', district: 'TP. Thủ Đức', distanceKm: 5.6, hostId: people.tuan.id, hostName: people.tuan.name,
      hostAvatar: 'tuan', hostAvatarColor: people.tuan.avatarColor, hostVerified: true,
      participants: [people.tuan, people.minh, people.huy, people.ngoc, people.nam], maxParticipants: 8,
      vibe: ['Bia', 'Nhậu', 'Người mới'], paymentType: 'Mỗi người tự trả',
      description: 'Thử flight 4 loại craft + khoai chiên. Hợp cho người mới, host sẽ giới thiệu từng vị.',
      status: 'upcoming', isPublic: true, image: 'games', color: '#F4B400',
      alcoholType: 'Bia craft', menuItems: [{ name: 'Flight 4 ly', price: 180000 }, { name: 'Khoai chiên', price: 90000 }],
      billNote: 'Tự trả phần mình.', drinkLimit: 'Tối đa 5 lon', age18Plus: true,
      mapQuery: 'Heart of Darkness Thảo Điền', tableBooked: true,
    },
    {
      id: 'lau-bo-cuoi-tuan', title: 'Lẩu bò + vài lon cuối tuần', category: 'Lẩu nướng', date: localIso(saturday), dateLabel: 'Thứ Bảy', time: '18:00',
      location: 'Lẩu Bò Cô Thảo', district: 'Quận 3', distanceKm: 2.1, hostId: people.lan.id, hostName: people.lan.name,
      hostAvatar: 'lan', hostAvatarColor: people.lan.avatarColor, hostVerified: true,
      participants: [people.lan, people.minh, people.huy, people.ngoc], maxParticipants: 6,
      vibe: ['Nhậu', 'Vui vẻ', 'Nhóm nhỏ'], paymentType: 'Chia đều (Campuchia)',
      description: 'Nồi lẩu bò 4 người + rau thêm thoải mái. Uống lai rai, ai không uống có trà đá/soda.',
      status: 'upcoming', isPublic: true, image: 'dinner', color: '#D97733',
      alcoholType: 'Bia hơi', menuItems: [{ name: 'Lẩu bò nhỏ', price: 280000 }, { name: 'Bia Saigon', price: 20000 }],
      billNote: 'Chia đều cả lẩu + nước.', drinkLimit: 'Tối đa 3 lon', age18Plus: true,
      mapQuery: 'Lẩu Bò Cô Thảo Quận 3', tableBooked: false,
    },
    {
      id: 'startup-chill', title: 'Startup & chill (không cồn)', category: 'Networking', date: localIso(0), dateLabel: 'Tối nay', time: '19:30',
      location: 'The Workshop Coffee', district: 'Quận 1', distanceKm: 1.2, hostId: people.minh.id, hostName: people.minh.name,
      hostAvatar: 'profile-minh-anh', hostAvatarColor: people.minh.avatarColor, hostVerified: true,
      participants: [people.minh, people.lan, people.nam, people.ngoc], maxParticipants: 6,
      vibe: ['Chill', 'Rooftop', 'Networking'], paymentType: 'Mỗi người tự trả',
      description: 'Option cho ai không nhậu: café trò chuyện sản phẩm/startup. Tách riêng với team bia.',
      status: 'upcoming', isPublic: true, image: 'rooftop', color: '#F28C28',
      alcoholType: 'Không cồn', menuItems: [{ name: 'Cà phê', price: 55000 }],
      billNote: 'Tự trả.', drinkLimit: 'Vui là chính', age18Plus: false,
      mapQuery: 'The Workshop Coffee Quận 1', tableBooked: false,
    },
    {
      id: 'boardgame-weekend', title: 'Board game + bia nhẹ', category: 'Board game', date: localIso(saturday), dateLabel: 'Thứ Bảy', time: '18:00',
      location: 'Meeple House', district: 'Bình Thạnh', distanceKm: 3.4, hostId: people.tuan.id, hostName: people.tuan.name,
      hostAvatar: 'tuan', hostAvatarColor: people.tuan.avatarColor, hostVerified: true,
      participants: [people.tuan, people.minh, people.huy, people.ngoc, people.nam], maxParticipants: 8,
      vibe: ['Board game', 'Nhóm nhỏ', 'Người mới'], paymentType: 'Chia đều (Campuchia)',
      description: 'Chơi Avalon/Codenames, ai thua uống 1 hớp (có soda cho người không uống).',
      status: 'upcoming', isPublic: true, image: 'games', color: '#F4B400',
      alcoholType: 'Mix', menuItems: [{ name: 'Combo board game + 1 nước', price: 99000 }],
      billNote: 'Chia đều phí bàn.', drinkLimit: 'Không ép uống', age18Plus: true,
      mapQuery: 'Meeple House Bình Thạnh', tableBooked: true,
    },
    {
      id: 'karaoke-friday', title: 'Karaoke + bia sau nhậu', category: 'Karaoke', date: localIso(friday), dateLabel: 'Thứ Sáu', time: '20:00',
      location: 'Nnice Võ Văn Tần', district: 'Quận 3', distanceKm: 2.1, hostId: people.lan.id, hostName: people.lan.name,
      hostAvatar: 'lan', hostAvatarColor: people.lan.avatarColor, hostVerified: true,
      participants: [people.lan, people.minh, people.huy, people.ngoc], maxParticipants: 6,
      vibe: ['Karaoke', 'Vui vẻ', 'Nhậu'], paymentType: 'Chia đều (Campuchia)',
      description: 'Tăng 2 sau kèo ốc/lẩu. Hát + lai rai nhẹ, tôn trọng người không uống.',
      status: 'upcoming', isPublic: true, image: 'karaoke', color: '#D97733',
      alcoholType: 'Bia hơi', menuItems: [{ name: 'Giờ hát', price: 120000 }, { name: 'Snack', price: 60000 }],
      billNote: 'Chia giờ hát + nước.', drinkLimit: 'Tự lượng sức', age18Plus: true,
      mapQuery: 'Nnice Karaoke Võ Văn Tần Quận 3', tableBooked: false,
    },
    {
      id: 'coffee-weekend', title: 'Café giải ngán cuối tuần', category: 'Café', date: localIso(saturday), dateLabel: 'Thứ Bảy', time: '09:30',
      location: 'Okkio Caffe', district: 'Quận 1', distanceKm: 0.8, hostId: people.ngoc.id, hostName: people.ngoc.name,
      hostAvatar: 'ngoc', hostAvatarColor: people.ngoc.avatarColor, hostVerified: false,
      participants: [people.ngoc, people.lan], maxParticipants: 4,
      vibe: ['Chill', 'Café', 'Nhóm nhỏ'], paymentType: 'Mỗi người tự trả',
      description: 'Sáng hôm sau của team nhậu: café trứng + kể chuyện tối qua.',
      status: 'upcoming', isPublic: true, image: 'coffee', color: '#A66A3F',
      alcoholType: 'Không cồn', menuItems: [{ name: 'Cà phê trứng', price: 65000 }],
      billNote: 'Tự trả.', drinkLimit: 'Vui là chính', age18Plus: false,
      mapQuery: 'Okkio Caffe Quận 1', tableBooked: false,
    },
    {
      id: 'rooftop-sunset', title: 'Rooftop chill ngắm hoàng hôn', category: 'Rooftop bia', date: localIso(0), dateLabel: 'Tối nay', time: '17:45',
      location: 'Chạng Vạng Rooftop', district: 'Bình Thạnh', distanceKm: 2.7, hostId: people.nam.id, hostName: people.nam.name,
      hostAvatar: 'nam', hostAvatarColor: people.nam.avatarColor, hostVerified: true,
      participants: [people.nam, people.tuan, people.lan], maxParticipants: 5,
      vibe: ['Rooftop', 'Chill', 'Nhậu'], paymentType: 'Mỗi người tự trả',
      description: 'Happy hour 17-19h giảm 20% bia. Đến sớm giữ bàn view sông.',
      status: 'upcoming', isPublic: true, image: 'rooftop', color: '#E89B45',
      alcoholType: 'Cocktail', menuItems: [{ name: 'Cocktail hoàng hôn', price: 110000 }, { name: 'Bia happy hour', price: 35000 }],
      billNote: 'Tự trả, giữ bill để campuchia nếu muốn.', drinkLimit: 'Tối đa 3 lon', age18Plus: true,
      mapQuery: 'Chạng Vạng Rooftop Bình Thạnh', tableBooked: true,
    },
    {
      id: 'small-dinner', title: 'Đi ăn tối nhóm nhỏ', category: 'Ăn uống', date: localIso(1), dateLabel: 'Ngày mai', time: '19:00',
      location: 'Bếp Mẹ Ỉn', district: 'Quận 1', distanceKm: 1.9, hostId: people.huy.id, hostName: people.huy.name,
      hostAvatar: 'huy', hostAvatarColor: people.huy.avatarColor, hostVerified: false,
      participants: [people.huy, people.nam], maxParticipants: 4,
      vibe: ['Ăn uống', 'Nhóm nhỏ', 'Vui vẻ'], paymentType: 'Chia đều (Campuchia)',
      description: 'Mở bát nhẹ trước khi qua quán bia kế bên. Mỗi người gọi 1 món share cả bàn.',
      status: 'upcoming', isPublic: true, image: 'dinner', color: '#C86D46',
      alcoholType: 'Không cồn', menuItems: [{ name: 'Cơm nhà share', price: 120000 }],
      billNote: 'Chia đều.', drinkLimit: 'Vui là chính', age18Plus: false,
      mapQuery: 'Bếp Mẹ Ỉn Quận 1', tableBooked: false,
    },
    {
      id: 'easy-run', title: 'Chạy bộ giải bia buổi chiều', category: 'Khác', date: localIso(2), dateLabel: labelForOffset(2), time: '17:30',
      location: 'Công viên Bờ sông Sài Gòn', district: 'TP. Thủ Đức', distanceKm: 5.6, hostId: people.nam.id, hostName: people.nam.name,
      hostAvatar: 'nam', hostAvatarColor: people.nam.avatarColor, hostVerified: true,
      participants: [people.nam, people.huy, people.tuan], maxParticipants: 8,
      vibe: ['Người mới', 'Vui vẻ'], paymentType: 'Miễn phí',
      description: 'Kèo giải ngán sau cuối tuần nhậu: chạy 4km pace nhẹ, xong uống nước mía.',
      status: 'upcoming', isPublic: true, image: 'running', color: '#6C9A68',
      alcoholType: 'Không cồn', menuItems: [], billNote: 'Miễn phí.', drinkLimit: 'Vui là chính', age18Plus: false,
      mapQuery: 'Công viên Bờ sông Sài Gòn', tableBooked: false,
    },
    {
      id: 'creative-workshop', title: 'Workshop sáng tạo cuối tuần', category: 'Khác', date: localIso(sunday), dateLabel: 'Chủ Nhật', time: '14:00',
      location: 'The Lab Saigon', district: 'Quận 3', distanceKm: 3.0, hostId: people.lan.id, hostName: people.lan.name,
      hostAvatar: 'lan', hostAvatarColor: people.lan.avatarColor, hostVerified: true,
      participants: [people.lan, people.ngoc, people.minh], maxParticipants: 10,
      vibe: ['Networking', 'Người mới', 'Vui vẻ'], paymentType: '120.000đ/người',
      description: 'Mang một ý tưởng quán nhậu trong mơ đến workshop, cùng phác thảo menu.',
      status: 'upcoming', isPublic: true, image: 'workshop', color: '#8A74A5',
      alcoholType: 'Không cồn', menuItems: [], billNote: '120k/người.', drinkLimit: 'Vui là chính', age18Plus: false,
      mapQuery: 'The Lab Saigon Quận 3', tableBooked: false,
    },
  ];
  const chats: ChatRoom[] = [
    {
      meetupId: 'nhau-rooftop-toi-nay', unread: 2, onlineCount: 3,
      messages: [
        message('msg-nhau-1', people.lan, 'Tối nay ngồi bàn view sông nha, mình đặt bàn rồi.', at(0, 18, 20)),
        message('msg-nhau-2', people.nam, 'Mình tới sớm 10p giữ chỗ, ai tới cứ nhắn nhé! Ai không uống có soda.', at(0, 18, 42)),
      ],
    },
    {
      meetupId: 'quan-oc-quan-1', unread: 1, onlineCount: 2,
      messages: [
        message('msg-oc-1', people.ngoc, 'Quán đông, mọi người tới trước 18h45 nha. Ốc len hết sớm lắm.', at(0, 17, 30)),
      ],
    },
    {
      meetupId: 'startup-chill', unread: 2, onlineCount: 3,
      messages: [
        message('msg-start-1', people.lan, 'Tối nay tụi mình ngồi bàn gần cửa sổ nha.', at(0, 18, 20)),
        message('msg-start-2', people.nam, 'Mình tới sớm khoảng 10 phút, ai tới cứ nhắn nhé!', at(0, 18, 42)),
      ],
    },
    {
      meetupId: 'boardgame-weekend', unread: 0, onlineCount: 2,
      messages: [
        message('msg-board-1', people.tuan, 'Mình đã đặt bàn rồi nhé. Có Codenames và Avalon.', at(-1, 20, 15)),
        message('msg-board-2', people.minh, 'Hay quá, mình sẽ mang thêm Uno!', at(-1, 20, 19)),
        message('msg-board-3', people.huy, 'Mình sẽ tới sau khoảng 10 phút nhé.', at(-1, 20, 22)),
      ],
    },
    {
      meetupId: 'karaoke-friday', unread: 1, onlineCount: 1,
      messages: [message('msg-karaoke-1', people.lan, '20h mọi người nha, không cần hát hay đâu 😄', at(-2, 16, 10))],
    },
    {
      meetupId: 'creative-workshop', unread: 0, onlineCount: 2,
      messages: [message('msg-workshop-1', people.lan, 'Mọi người mang theo sổ tay là đủ nha.', at(-1, 11, 30))],
    },
  ];
  return {
    version: 3,
    currentUser: null,
    profile,
    meetups,
    chats,
    reviews: [
      { id: 'review-1', author: 'Lan Chi', rating: 5, date: '2 tuần trước', text: 'Host chu đáo, chọn quán xinh và giúp mọi người làm quen rất tự nhiên.' },
      { id: 'review-2', author: 'Tuấn Nguyễn', rating: 4.9, date: '1 tháng trước', text: 'Không khí thoải mái, thông tin rõ ràng và mọi người rất đúng giờ.' },
      { id: 'review-3', author: 'Ngọc Anh', rating: 5, date: '2 tháng trước', text: 'Một buổi gặp nhỏ nhưng vui. Mình đã quen thêm được vài người bạn mới.' },
    ],
    users,
    friendIds: [people.lan.id, people.tuan.id],
    sentFriendRequestIds: [people.nam.id],
    receivedFriendRequestIds: [people.ngoc.id],
    blockedUsers: [people.huy],
    notifications: [
      { id: 'notification-request', type: 'friend_request', title: 'Ngọc Anh đã gửi lời mời kết bạn', description: 'Hai bạn cùng tham gia Board game + bia nhẹ.', createdAt: minutesAgo(12), read: false, userId: people.ngoc.id },
      { id: 'notification-friend', type: 'friend_accepted', title: 'Lan Chi đã chấp nhận lời mời kết bạn', description: 'Hai bạn giờ đã có thể theo dõi các kèo nhậu chung.', createdAt: minutesAgo(85), read: false, userId: people.lan.id },
      { id: 'notification-meetup', type: 'meetup', title: 'Bạn đã được thêm vào kèo Rooftop bia sau giờ làm', description: 'Kèo bắt đầu lúc 19:30 tại Bình Thạnh.', createdAt: minutesAgo(260), read: true, meetupId: 'nhau-rooftop-toi-nay' },
      { id: 'notification-chat', type: 'chat', title: 'Có tin nhắn mới trong Quán ốc vỉa hè Quận 1', description: 'Ngọc Anh: Quán đông, mọi người tới trước 18h45 nha.', createdAt: minutesAgo(1440), read: false, meetupId: 'quan-oc-quan-1' },
    ],
    notificationsEnabled: true,
  };
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function meetupPreferenceScore(meetup: Meetup, interests: string[], preferredVibes: string[]) {
  const preferences = new Set([...interests, ...preferredVibes].map(normalize));
  return [meetup.category, meetup.alcoholType ?? '', ...meetup.vibe].reduce((score, value) => score + (value && preferences.has(normalize(value)) ? 1 : 0), 0);
}

export function filterAndSortMeetups(meetups: Meetup[], query: string, filters: string[], sort: MeetupSort = 'Gần nhất') {
  const needle = normalize(query);
  const filtered = meetups.filter((meetup) => {
    const haystack = normalize(`${meetup.title} ${meetup.category} ${meetup.alcoholType ?? ''} ${meetup.location} ${meetup.district} ${meetup.vibe.join(' ')} ${(meetup.menuItems ?? []).map((m) => m.name).join(' ')}`);
    if (needle && !haystack.includes(needle)) return false;
    return filters.every((filter) => {
      if (filter === 'Tất cả') return true;
      if (filter === 'Tối nay') return meetup.dateLabel === 'Tối nay';
      if (filter === 'Gần đây') return meetup.distanceKm <= 3;
      if (filter === '2–4 người') return meetup.maxParticipants <= 4;
      const norm = normalize(filter);
      if (norm === 'nhau') return normalize(meetup.category).includes('nhau') || meetup.vibe.some((v) => normalize(v).includes('nhau')) || (meetup.alcoholType ?? '').length > 0;
      return normalize(meetup.category) === norm || normalize(meetup.alcoholType ?? '') === norm || meetup.vibe.some((item) => normalize(item) === norm);
    });
  });
  return [...filtered].sort((a, b) => {
    if (sort === 'Sắp diễn ra') return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
    if (sort === 'Còn nhiều chỗ') return (b.maxParticipants - b.participants.length) - (a.maxParticipants - a.participants.length);
    return a.distanceKm - b.distanceKm;
  });
}

export function visibleMeetupsForUser(meetups: Meetup[], userId?: string) {
  return meetups.filter((meetup) => meetup.isPublic !== false
    || meetup.hostId === userId
    || meetup.participants.some((participant) => participant.id === userId));
}

export function meetupDateLabel(date: string) {
  if (date === localIso(0)) return 'Tối nay';
  if (date === localIso(1)) return 'Ngày mai';
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime()) ? 'Sắp tới' : value.toLocaleDateString('vi-VN', { weekday: 'long' });
}

export function formatDistance(distanceKm: number) {
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

export function formatVND(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function buildMapUrl(query?: string) {
  if (!query) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, TP. Hồ Chí Minh`)}`;
}

export function estimateBillPerPerson(meetup: Pick<Meetup, 'menuItems' | 'participants' | 'maxParticipants'>) {
  const total = (meetup.menuItems ?? []).reduce((sum, item) => sum + item.price, 0);
  const count = Math.max(1, meetup.participants.length);
  if (!total) return null;
  return Math.round(total * (meetup.maxParticipants > 4 ? 1.5 : 1) / count);
}

export function calcCampuchiaShares(total: number, userIds: string[]): BillShare[] {
  if (!userIds.length || total <= 0) return [];
  const base = Math.floor(total / userIds.length);
  const remainder = total - base * userIds.length;
  return userIds.map((userId, idx) => ({
    userId,
    amount: base + (idx < remainder ? 1 : 0),
    paid: false,
    checkedIn: false,
  }));
}

export function unpaidShares(meetup: Pick<Meetup, 'billShares'>) {
  return (meetup.billShares ?? []).filter((s) => !s.paid);
}

export function formatTrust(score?: number) {
  if (score == null) return 'Mới';
  return `${score}% uy tín`;
}

export function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatMessageTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const diff = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diff === 1) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { weekday: 'short' });
}
