@echo off
echo Starting AI Business Assistant...
echo.
echo Starting Backend on http://localhost:5000
start "Backend" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Open http://localhost:5173 in your browser.
pause
