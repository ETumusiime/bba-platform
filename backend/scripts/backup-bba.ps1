# ===============================================
# BBA Platform — Smart Overwrite-Mode Backup
# ===============================================
# This script overwrites a single backup folder:
#   C:\Users\Edwin Tumusiime\bba-backups\bba-platform-backup-latest
# It includes:
#   backend + frontend code
#   uploads (book covers)
#   .env files
#   PostgreSQL database dump (optional)
# ===============================================

# --- CONFIGURATION ---
$projectRoot = "C:\Users\Edwin Tumusiime\bba-platform"
$backupRoot  = "C:\Users\Edwin Tumusiime\bba-backups"
$backupDir   = Join-Path $backupRoot "bba-platform-backup-latest"
$uploadsPath = "$projectRoot\frontend\public\uploads"
$dbName      = "bba_db"
$dbUser      = "postgres"
$dbDumpPath  = "$backupDir\bba-db-latest.dump"

# --- 1. Remove Previous Backup (Overwrite Mode) ---
if (Test-Path $backupDir) {
    Write-Host "Removing previous backup..."
    Remove-Item -Recurse -Force $backupDir
}
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# --- 2. Copy Frontend & Backend (Mirror Mode) ---
Write-Host "Copying frontend & backend source files..."
robocopy "$projectRoot\backend" "$backupDir\backend" /MIR /XD node_modules dist .next .vercel /NFL /NDL /NJH /NJS
robocopy "$projectRoot\frontend" "$backupDir\frontend" /MIR /XD node_modules dist .next .vercel /NFL /NDL /NJH /NJS

# --- 3. Copy Uploads (Book Covers) ---
if (Test-Path $uploadsPath) {
    Write-Host "Copying uploaded images..."
    robocopy $uploadsPath "$backupDir\frontend\public\uploads" /MIR /NFL /NDL /NJH /NJS
} else {
    Write-Host "No uploads folder found — skipping..."
}

# --- 4. Copy .env Files ---
$backendEnv  = "$projectRoot\backend\.env"
$frontendEnv = "$projectRoot\frontend\.env.local"

if (Test-Path $backendEnv) {
    Copy-Item $backendEnv "$backupDir\backend\.env" -Force
    Write-Host "backend\.env copied."
} else {
    Write-Host "backend\.env not found!"
}

if (Test-Path $frontendEnv) {
    Copy-Item $frontendEnv "$backupDir\frontend\.env.local" -Force
    Write-Host "frontend\.env.local copied."
} else {
    Write-Host "frontend\.env.local not found!"
}

# --- 5. Export PostgreSQL Database (Optional) ---
try {
    Write-Host "Dumping PostgreSQL database '$dbName'..."
    & pg_dump -U $dbUser -F c -b -v -f $dbDumpPath $dbName
    Write-Host "Database exported successfully."
} catch {
    Write-Host "Skipping database dump — check if pg_dump is installed and in PATH."
}

# --- 6. Completion Summary ---
Write-Host ""
Write-Host "==============================================="
Write-Host "Backup completed successfully!"
Write-Host "Backup folder: $backupDir"
Write-Host "Database dump: bba-db-latest.dump"
Write-Host "==============================================="

# --- Windows Popup ---
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show("Backup Completed Successfully!`n`nLocation:`n$backupDir", "BBA Backup", "OK", "Information")

# --- Keep window open ---
pause
