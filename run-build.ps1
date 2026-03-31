#!/usr/bin/env pwsh
# Build script for Employee Tracking System

$projectPath = "c:\Users\MD\Downloads\Compressed\Tracking Update\imagine-projects-project-69972ed4001c0b3493d8-b81a34cc536748c2b3de3950ef02c0773aee4aee"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Employee Tracking System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectPath

# Check for bun
$bunPath = (Get-Command bun -ErrorAction SilentlyContinue).Source
if ($bunPath) {
    Write-Host "[OK] Bun is installed at: $bunPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 1: Installing dependencies with Bun..." -ForegroundColor Cyan
    & bun install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Dependencies installed" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 2: Building project..." -ForegroundColor Cyan
        & bun run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "[SUCCESS] Build completed successfully!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Build output is in the 'dist' folder" -ForegroundColor Green
            exit 0
        } else {
            Write-Host ""
            Write-Host "[ERROR] Build failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check for npm
$npmPath = (Get-Command npm -ErrorAction SilentlyContinue).Source
if ($npmPath) {
    Write-Host "[OK] NPM is installed at: $npmPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 1: Installing dependencies with NPM..." -ForegroundColor Cyan
    & npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Dependencies installed" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 2: Building project..." -ForegroundColor Cyan
        & npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "[SUCCESS] Build completed successfully!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Build output is in the 'dist' folder" -ForegroundColor Green
            exit 0
        } else {
            Write-Host ""
            Write-Host "[ERROR] Build failed!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[ERROR] Neither Bun nor NPM is installed!" -ForegroundColor Red
Write-Host ""
Write-Host "Please install one of the following:" -ForegroundColor Yellow
Write-Host "1. Bun (recommended): https://bun.sh/" -ForegroundColor Yellow
Write-Host "2. Node.js (includes NPM): https://nodejs.org/" -ForegroundColor Yellow
Write-Host ""
exit 1
