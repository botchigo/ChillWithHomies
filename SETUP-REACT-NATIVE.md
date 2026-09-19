# Chạy ChillWithHomies

Ứng dụng đã có sẵn trong `mobile/`, dùng React Native 0.86.3, React 19.2.3 và Expo SDK 57.0.0.
Gói `expo` dùng bản vá `~57.0.23`, tương thích Expo Go cho SDK 57.
Không cần chạy lại `create-expo-app` hoặc script `tools/create-expo.ps1`.

## Yêu cầu Node.js

Dùng Node 22.13 trở lên trong nhánh 22, hoặc Node 24.3 trở lên trong nhánh 24.
Phiên bản kiểm tra của dự án là Node 22.23.2 (ghi trong `mobile/.nvmrc`).
Node 22.11 cũ trên máy không đáp ứng yêu cầu của Metro/React Native mới.

Nếu chưa nâng Node toàn máy, có thể chạy Expo bằng Node 22 tải qua npm:

```powershell
cd D:\ChillWithHomies\ChillWithHomies\mobile
npm.cmd exec --yes --package=node@22 -- node node_modules/expo/bin/cli start --clear
```

Lệnh này dùng Node trong bộ nhớ đệm npm, không thay thế Node toàn máy.

## Khởi chạy trên Windows

Mở PowerShell:

```powershell
cd D:\ChillWithHomies\ChillWithHomies\mobile
```

Nếu mới tải repository hoặc chưa có `node_modules`, cài dependencies theo lockfile:

```powershell
npm.cmd ci
```

Chạy bản web:

```powershell
npm.cmd run web
```

Hoặc khởi động Expo:

```powershell
npm.cmd start
```

- Điện thoại: dùng Expo Go tương thích SDK 57, kết nối cùng Wi-Fi rồi quét QR.
- Android emulator: mở máy ảo trong Android Studio, sau đó nhấn `a` trong terminal Expo.
- Dừng server bằng `Ctrl + C`.
- Nếu cần làm mới cache: `npm.cmd start -- --clear`.

`npm.cmd run android` chạy build native (`expo run:android`), cần Android SDK và JDK phù hợp với Gradle của project. Lệnh này khác với việc mở app bằng Expo Go.

Project Android đã được tạo lại cho SDK 57. Bản Android cũ được giữ cục bộ trong
`mobile/.expo/native-backup-sdk54/android/`. Các thư mục này không được commit vào Git.
Nếu đã cài bản native SDK 54, cần build/cài lại bản native sau khi nâng SDK.

## Kiểm tra mã nguồn

Chạy trong `mobile/`:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npx.cmd expo export --platform web
npx.cmd expo install --check
npx.cmd expo-doctor
```

Bản web xuất ra `mobile/dist/` (đã được Git bỏ qua).

Tham khảo [hướng dẫn nâng SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
và [thay đổi SDK 57](https://expo.dev/changelog/sdk-57).

## Trạng thái tính năng

- App mở vào màn hình `/signin`.
- `SIGN IN (DEMO)` cho phép dùng thông tin mẫu không rỗng để xem trang chính; không xác thực hoặc lưu tài khoản.
- Nút Facebook/Google hiển thị thông báo chưa hỗ trợ trong demo.
- Đăng ký, OTP, chụp giấy tờ, NFC, nhận diện khuôn mặt và đổi mật khẩu vẫn là mô phỏng. Trang review hiện dùng dữ liệu mẫu.
- Chưa có backend, gửi SMS/email, kết nối camera/NFC hoặc xác thực tài khoản thật.
- Dùng dữ liệu mẫu khi thử các màn hình.
