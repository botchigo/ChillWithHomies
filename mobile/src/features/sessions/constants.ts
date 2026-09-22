export const ALCOHOL_TYPES = ['Bia hơi', 'Bia craft', 'Rượu', 'Cocktail', 'Không cồn', 'Mix'] as const;
export const BILL_SPLITS = ['Chia đều (Campuchia)', 'Mỗi người tự trả', 'Host mời', 'Chia theo món', 'Thống nhất tại quán'] as const;
export const DRINK_LIMITS = ['Vui là chính', 'Tối đa 3 lon', 'Tối đa 5 lon', 'Không ép uống', 'Tự lượng sức'] as const;
export const SESSION_CATEGORIES = ['Nhậu', 'Bia', 'Quán ốc', 'Lẩu nướng', 'Rooftop bia', 'Ăn uống', 'Café', 'Board game', 'Karaoke', 'Networking', 'Khác'] as const;
export const SESSION_SAFETY_TIPS = [
  'Chỉ 18+ mới tham gia kèo có cồn.',
  'Gặp ở quán công cộng, đông người.',
  'Đã uống thì không lái xe — đặt Grab về.',
  'Không ép uống, tôn trọng người uống không cồn.',
] as const;
export const DEPOSIT_OPTIONS = [0, 30000, 50000, 100000] as const;
export const SESSION_FILTERS = ['Tất cả', 'Tối nay', 'Gần đây', 'Nhậu', 'Bia', 'Rooftop', 'Quán ốc', 'Chill', '2–4 người'] as const;
export type MeetupFilter = (typeof SESSION_FILTERS)[number];
