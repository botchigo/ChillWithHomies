# ChillWithHomies

Ứng dụng tìm, tạo và tham gia meetup tại TP.HCM, xây bằng React Native, Expo SDK 57 và Expo Router. Mã ứng dụng
nằm trong `mobile/`; khung Supabase và API contract nằm trong [`backend/`](backend/README.md).

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

## Đăng nhập bằng OTP

Ứng dụng chỉ đăng nhập bằng OTP gửi tới số điện thoại Việt Nam; không có mật khẩu hoặc mã OTP hard-code. Tại `/signup`, luồng onboarding 5 bước kiểm tra username trên server, tải ảnh đại diện vào bucket private, xác thực người dùng đủ 18 tuổi, thu thập sở thích và yêu cầu đồng ý an toàn trước khi tạo tài khoản. Tiến trình onboarding được lưu cục bộ để có thể tiếp tục sau khi reload, nhưng mã OTP không được lưu.

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

Bản web production được xuất vào `mobile/dist/`. Auth, hồ sơ và avatar dùng Supabase; các module meetup/chat/social vẫn đang được chuyển dần khỏi dữ liệu local theo từng phase. Bill chỉ là demo ledger, không có thanh toán thật.
