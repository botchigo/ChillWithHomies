# ChillWithHomies

Demo app tìm, tạo và tham gia meetup tại TP.HCM, xây bằng React Native, Expo SDK 57 và Expo Router. Mã ứng dụng nằm trong `mobile/`.

## Cài đặt và chạy

Yêu cầu Node.js 22.13+ hoặc 24.3+.

```powershell
cd mobile
npm.cmd ci
```

Chạy trên web:

```powershell
npm.cmd run web
```

Chạy bằng Expo Go hoặc emulator:

```powershell
npm.cmd start
```

Quét QR bằng Expo Go, hoặc nhấn `a` để mở Android emulator. Native build có thể chạy bằng `npm.cmd run android`; `npm.cmd run ios` cần macOS và Xcode.

## Đăng nhập demo

Không có tài khoản cố định. Dùng số điện thoại hợp lệ gồm 9–11 chữ số và mật khẩu từ 6 ký tự, ví dụ `0901234567` / `chill123`. Tại `/signup`, luồng onboarding 5 bước dùng OTP demo `123456`, kiểm tra username, cho chọn ảnh đại diện, tự định dạng ngày sinh `MM-DD-YYYY`, thu thập sở thích và yêu cầu đồng ý an toàn trước khi tạo tài khoản. Tiến trình được lưu để tiếp tục sau khi reload; password và OTP không được lưu.

## Route chính

- Auth: `/signin`, `/signup`, `/forgot-password`
- App: `/`, `/explore`, `/create`, `/chat`, `/profile`
- Chi tiết: `/meetup/:id`, `/chat/:meetupId`, `/profile/:id`
- Social: `/friends`, `/notifications`
- Style guide: `/design-system`

Các route app yêu cầu đăng nhập. Sau khi đăng nhập, bạn có thể tìm/lọc meetup, tham gia hoặc rời kèo, tạo meetup, nhắn tin nhóm, kết bạn, quản lý lời mời/chặn và xem thông báo.

## Dữ liệu demo

Meetup, phòng chat, tin nhắn, hồ sơ, quan hệ bạn bè, block và thông báo được lưu bằng AsyncStorage; bản web dùng local storage nên dữ liệu vẫn còn sau khi reload. Để quay lại dữ liệu mẫu, mở **Tôi → Cài đặt → Khôi phục dữ liệu demo**. Đăng xuất chỉ xóa phiên đăng nhập.

## Kiểm tra và export

Chạy trong `mobile/`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npx.cmd expo export --platform web
```

Bản web production được xuất vào `mobile/dist/`. Đây là demo local-first, chưa có backend, realtime server, SMS hay thanh toán thật.
