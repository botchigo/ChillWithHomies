export type CreateMeetupFormErrors = Partial<Record<'title' | 'location' | 'date' | 'description' | 'age', string>>;

export type CreateMeetupFormValues = {
  title: string;
  location: string;
  date: string;
  time: string;
  description: string;
  ageConfirmed: boolean;
};

export type MeetupDateOption = {
  value: string;
  label: string;
};

export function toLocalIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createMeetupDateOptions(today = new Date(), count = 14): MeetupDateOption[] {
  return Array.from({ length: count }, (_, index) => {
    const value = new Date(today);
    value.setHours(12, 0, 0, 0);
    value.setDate(value.getDate() + index);
    const prefix = index === 0
      ? 'Hôm nay'
      : index === 1
        ? 'Ngày mai'
        : value.toLocaleDateString('vi-VN', { weekday: 'long' });

    return {
      value: toLocalIsoDate(value),
      label: `${prefix}, ${value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`,
    };
  });
}

export function validateCreateMeetupForm(
  values: CreateMeetupFormValues,
  now = new Date(),
): CreateMeetupFormErrors {
  const errors: CreateMeetupFormErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Vui lòng đặt tên cho kèo nhậu.';
  else if (title.length < 3) errors.title = 'Tên kèo cần ít nhất 3 ký tự.';

  if (!values.location.trim()) errors.location = 'Vui lòng nhập quán nhậu / địa điểm.';

  const startsAt = new Date(`${values.date}T${values.time}:00`);
  if (Number.isNaN(startsAt.getTime()) || startsAt <= now) {
    errors.date = 'Ngày và giờ nhậu phải ở trong tương lai.';
  }

  if (values.description.length > 300) errors.description = 'Mô tả tối đa 300 ký tự.';
  if (!values.ageConfirmed) errors.age = 'Bạn cần xác nhận tất cả thành viên đã đủ 18 tuổi.';

  return errors;
}
