param(
    [string]$Name = "mobile"
)

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Error "npx không tìm thấy. Cài Node.js và npm trước khi chạy script này."
    exit 1
}

Write-Host "Tạo project Expo: $Name"
npx create-expo-app $Name
if ($LASTEXITCODE -ne 0) { Write-Error "create-expo-app thất bại."; exit $LASTEXITCODE }

Set-Location -Path $Name
Write-Host "Cài dependencies..."
npm install

Write-Host "Mở Metro bundler (expo start)..."
npx expo start
