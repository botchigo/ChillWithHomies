# Hướng dẫn nhanh thiết lập React Native (Expo)

Yêu cầu trước khi bắt đầu:
- Cài Node.js (LTS) và `npm` hoặc `yarn`.
- (Windows) Cài Android Studio nếu bạn muốn chạy trên emulator.
- Tuỳ chọn: cài `expo-cli` toàn cục: `npm install -g expo-cli` (không bắt buộc).

## Tạo project Expo (khuyến nghị)

1. Mở PowerShell/terminal ở thư mục dự án:

```powershell
npx create-expo-app mobile
cd mobile
npm install
npx expo start
```

2. Chạy app trên thiết bị/emulator:
- Quét QR code bằng Expo Go (Android/iOS) để mở app trên điện thoại thật.
- Hoặc chạy emulator Android: trong Android Studio tạo AVD, sau đó
  ```powershell
  npx expo run:android
  ```

## Ghi chú nhanh
- Nếu muốn build APK/AAB hay chạy native modules, xem tài liệu Expo/React Native.
- Thư mục project mẫu sẽ là `mobile/`.

## Script tạo nhanh (PowerShell)
- Có thể dùng script `tools/create-expo.ps1` để khởi tạo nhanh dự án từ gốc repo.

---

Muốn mình tự scaffold project `mobile` trong workspace luôn không? (trả lời trong chat)
