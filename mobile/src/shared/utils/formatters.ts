export function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

export function formatMessageTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  const dayDifference = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (dayDifference === 1) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', { weekday: 'short' });
}
