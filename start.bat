@echo off
echo ============================================
echo  Lung Cancer Detection - Starting Servers
echo ============================================
echo.

echo Starting backend on http://localhost:8000 ...
start "Backend" cmd /k "python main.py"

timeout /t 3 /nobreak >nul

echo Starting frontend on http://localhost:5000 ...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows.
echo  Backend : http://localhost:8000
echo  Frontend: http://localhost:5000
echo  API docs: http://localhost:8000/docs
echo.
pause
