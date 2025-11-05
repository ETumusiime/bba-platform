# ============================================================
# BBA - Batch Import of All Book SQL Files
# ============================================================
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\backend\seed\Import-AllBooks.ps1
# ============================================================

$bookFolder = Join-Path $PSScriptRoot 'books'
$files = Get-ChildItem -Path $bookFolder -Filter *.sql

if ($files.Count -eq 0) {
    Write-Host "⚠️ No .sql files found in $bookFolder" -ForegroundColor Yellow
    exit
}

Write-Host "📘 Found $($files.Count) book SQL file(s) to import..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    Write-Host "⏳ Importing $($file.Name)..."
    psql -U postgres -d bba -f $file.FullName
    Write-Host "✅ Imported $($file.Name)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🎯 All book inserts completed successfully!" -ForegroundColor Green
