@echo off
REM 啟動 Node 代理伺服器
start "Node Proxy" cmd /k "node proxy.js"

REM 等待 3 秒讓伺服器啟動
timeout /t 3 /nobreak >nul

REM 在預設瀏覽器中開啟 Index.html
start "" "http://localhost:3101/index.html"
