# Food Delivery App - Start Script
# Run this with: .\start.ps1

Write-Host "Starting Food Delivery App..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in the windows to stop services" -ForegroundColor Yellow
Write-Host ""

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND SERVER' -ForegroundColor Cyan; Write-Host 'Running at: http://localhost:5173' -ForegroundColor Green; Write-Host ''; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND SERVER' -ForegroundColor Cyan; Write-Host 'Running at: http://localhost:5000' -ForegroundColor Green; Write-Host ''; cd backend; npm run dev"

Write-Host "Services started in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Open your browser to: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
