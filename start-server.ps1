#!/usr/bin/env pwsh

# Uncloud Server Startup Script
Write-Host "🚀 Starting Uncloud Server..." -ForegroundColor Green

# Change to server directory
Set-Location "d:\AI\Project\server"

# Check if index.js exists
if (-not (Test-Path "index.js")) {
    Write-Host "❌ Error: index.js not found in server directory" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path "../.env")) {
    Write-Host "❌ Error: .env file not found in project root" -ForegroundColor Red
    exit 1
}

# Start the server
Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔧 Starting Node.js server..." -ForegroundColor Yellow

try {
    node index.js
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    exit 1
}