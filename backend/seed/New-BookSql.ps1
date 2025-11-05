param(
    [Parameter(Mandatory=$true)]
    [string]$ISBN
)

# Define source (template) and destination (new file)
$src = Join-Path $PSScriptRoot 'add_book_template.sql'
$dstFolder = Join-Path $PSScriptRoot 'books'
$dst = Join-Path $dstFolder ($ISBN + '.sql')

# Ensure destination folder exists
if (!(Test-Path $dstFolder)) {
    New-Item -ItemType Directory -Path $dstFolder -Force | Out-Null
}

# Copy template and replace placeholders
Copy-Item $src $dst -Force
(Get-Content $dst) -replace '978XXXXXXXXXXX', $ISBN | Set-Content $dst

Write-Host ''
Write-Host "✅ Created new SQL insert file:" -ForegroundColor Green
Write-Host "   $dst"
Write-Host ''
Write-Host "Next steps:"
Write-Host "1️⃣ Save the book cover image as D:\BBA Coursebook Images\highres\$ISBN.jpg"
Write-Host "2️⃣ Open the new SQL file and paste Overview, Features, and Contents from Cambridge GO."
Write-Host "3️⃣ Run it using:"
Write-Host "   psql -U postgres -d bba -f `"backend\seed\books\$ISBN.sql`""
Write-Host ''
