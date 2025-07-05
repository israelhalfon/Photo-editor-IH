@echo off
echo Starting PhotoEditor Pro Server...
echo.
echo Opening browser in 3 seconds...
echo.

timeout /t 3 >nul

start http://localhost:8000

python -m http.server 8000

pause