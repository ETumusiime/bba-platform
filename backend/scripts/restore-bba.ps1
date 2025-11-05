# ===============================================
# BBA Platform — Restore Script (From Latest Backup)
# ===============================================
# This script restores the latest backup from:
#   C:\Users\Edwin Tumusiime\bba-backups\bba-platform-backup-latest
# into your active project directory:
#   C:\Users\Edwin Tumusiime\bba-platform
# ===============================================

# --- CONFIGURATION ---
$projectRoot = "C:\Users\Edwin Tumusiime\bba-platform"
$backupDir   = "C:\Users\Edwin Tumusiime\bba-backups\bba-platform-backup-latest"
$dbName      = "bba_db"
$dbUser      = "postgres"
$dbDumpPath  = "$backupDir\bba-db-latest.dump"

# --- 1. Confirm Restore Intent ---
Write-Host ""
Write-Host "==============================================="
Write-Host "⚠️  WARNING: You are about to RESTORE your BBA Platform from backup!"
Write-Host "Backup Source: $backupDir"
Write-Host "Target Folder: $projectRoot"
Write-Host "==============================================="
Write-Host ""
$confirm = Read-Host "Type 'YES' to confirm restore (case-sensitive)"
if ($confirm -ne "YES") {
    Write-Host "Restore cancelled by user."
    pause
    exit
}

# --- 2. Restore Backend & Frontend ---
Write-Host "Restoring backend and frontend files..."
robocopy "$backupDir\backend" "$projectRoot\backend" /MIR /NFL /NDL /NJH /NJS
robocopy "$backupDir\frontend" "$projectRoot\frontend" /MIR /NFL /NDL /NJH /NJS

# --- 3. Restore Uploads (Book Covers) ---
if (Test-Path "$backupDir\frontend\public\uploads") {
    Write-Host "Restoring uploaded images..."
    robocopy "$backupDir\frontend\public\uploads" "$projectRoot\frontend\public\uploads" /MIR /NFL /NDL /NJH /NJS
} else {
    Write-Host "No uploads found in backup."
}

# --- 4. Restore .env Files ---
if (Test-Path "$backupDir\backend\.env") {
    Copy-Item "$backupDir\backend\.env" "$projectRoot\backend\.env" -Force
    Write-Host "backend\.env restored."
} else {
    Write-Host "backend\.env missing from backup."
}

if (Test-Path "$backupDir\frontend\.env.local") {
    Copy-Item "$backupDir\frontend\.env.local" "$projectRoot\frontend\.env.local" -Force
    Write-Host "frontend\.env.local restored."
} else {
    Write-Host "frontend\.env.local missing from backup."
}

# --- 5. Restore PostgreSQL Database (Optional) ---
if (Test-Path $dbDumpPath) {
    try {
        Write-Host "Restoring PostgreSQL database '$dbName'..."
        & pg_restore -U $dbUser -d $dbName -c -v $dbDumpPath
        Write-Host "Database restored successfully."
    } catch {
        Write-Host "Database restore failed — check that pg_restore is in PATH and credentials are correct."
    }
} else {
    Write-Host "No database dump file found — skipping database restore."
}

# --- 6. Completion Summary ---
Write-Host ""
Write-Host "==============================================="
Write-Host "Restore completed successfully!"
Write-Host "Restored from: $backupDir"
Write-Host "==============================================="

# --- Windows Popup ---
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show("Restore Completed Successfully!`n`nRestored from:`n$backupDir", "BBA Restore", "OK", "Information")

# --- Keep window open ---
pause
