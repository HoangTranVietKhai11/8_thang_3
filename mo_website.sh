#!/bin/bash
# 🌸 Script mở website ngày 8/3
# Chạy: bash mo_website.sh

echo "🌸 Đang khởi động server..."

# Dừng server cũ nếu đang chạy ở port 8080
fuser -k 8080/tcp 2>/dev/null

# Khởi động Python HTTP server
python3 -m http.server 8080 --directory "$(dirname "$0")" &
SERVER_PID=$!

sleep 1

echo "✅ Server đang chạy tại: http://localhost:8080"

# Mở trình duyệt
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080
elif command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:8080
elif command -v chromium-browser &> /dev/null; then
    chromium-browser http://localhost:8080
fi

echo "🌸 Nhấn Ctrl+C để dừng server"
wait $SERVER_PID
