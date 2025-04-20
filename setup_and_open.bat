@echo off

:: 安裝 Node.js 依賴
if exist package.json (
    echo Installing Node.js dependencies...
    npm install
) else (
    echo package.json not found. Skipping npm install.
)

:: 啟動代理伺服器
start cmd /k "node proxy.js"

:: 開啟 index.html
start index.html

echo Setup complete. Proxy server is running, and index.html is opened in your default browser.
