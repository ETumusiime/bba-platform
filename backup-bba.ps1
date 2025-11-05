# ===============================================
# BBA Full System Backup Script (Stable Plain-Text Edition)
# ===============================================

# --- Configuration ---
$projectFolder = "C:\Users\Edwin Tumusiime\bba-platform"
$backupRoot    = "C:\Users\Edwin Tumusiime\bba-backups"
$timestamp     = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFolder  = Join-Path $backupRoot "BBA_Backup_$timestamp"

# --- Create backup folder ---
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null
}

# --- Backup project folders ---
Write-Host ""
Write-Host "Backing up project files..."
$sourceFolders = @("frontend", "backend", "prisma", "package.json")

foreach ($item in $sourceFolders) {
    $sourcePath = Join-Path $projectFolder $item
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $backupFolder -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Backed up $item"
    } else {
        Write-Host "Skipped missing item: $item"
    }
}

# --- Backup environment files ---
Write-Host ""
Write-Host "Backing up environment files..."
$envFiles = Get-ChildItem -Path $projectFolder -Filter ".env*" -Recurse -ErrorAction SilentlyContinue
foreach ($envFile in $envFiles) {
    Copy-Item -Path $envFile.FullName -Destination $backupFolder -Force
    Write-Host "Saved $($envFile.Name)"
}

# --- Database backup note ---
Write-Host ""
Write-Host "Checking for Supabase database configuration..."
if (Test-Path "$projectFolder\backend\.env") {
    $envContent = Get-Content "$projectFolder\backend\.env"
    $dbLine = $envContent | Where-Object { $_ -match "DB_NAME|DATABASE_URL" }
    if ($dbLine) {
        Write-Host "Database backup must be done manually from Supabase → SQL Editor → Download .sql"
    }
}

# --- Completion message ---
Write-Host ""
Write-Host "==============================================="
Write-Host "BBA Backup completed successfully!"
Write-Host "Location: $backupFolder"
Write-Host "Date: $(Get-Date)"
Write-Host "==============================================="

# ===============================================
# ✅ Windows Popup Notification
# ===============================================
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show(
    "Backup Completed Successfully!`n`nLocation:`n$backupFolder",
    "BBA Backup",
    "OK",
    "Information"
)

pause
