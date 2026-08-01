# Pack Next.js standalone cho Windows Plesk
# Chạy: npm run pack:plesk

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> npm install" -ForegroundColor Cyan
if (Test-Path "package-lock.json") { npm ci } else { npm install }

Write-Host "==> npm run build (standalone)" -ForegroundColor Cyan
npm run build

$Standalone = Join-Path $Root ".next\standalone"
$StaticSrc = Join-Path $Root ".next\static"
$PublicSrc = Join-Path $Root "public"

if (-not (Test-Path (Join-Path $Standalone "server.js"))) {
  throw "Build failed: missing .next/standalone/server.js"
}

Write-Host "==> Copy static + public vào standalone" -ForegroundColor Cyan
$StaticDest = Join-Path $Standalone ".next\static"
New-Item -ItemType Directory -Force -Path (Join-Path $Standalone ".next") | Out-Null
if (Test-Path $StaticDest) { Remove-Item $StaticDest -Recurse -Force }
Copy-Item $StaticSrc $StaticDest -Recurse -Force

if (Test-Path $PublicSrc) {
  $PublicDest = Join-Path $Standalone "public"
  if (Test-Path $PublicDest) { Remove-Item $PublicDest -Recurse -Force }
  Copy-Item $PublicSrc $PublicDest -Recurse -Force
}

Write-Host "==> Stage deploy package" -ForegroundColor Cyan
$Stage = Join-Path $Root ".plesk-stage"
$OutZip = Join-Path $Root "plesk-deploy.zip"

if (Test-Path $Stage) { Remove-Item $Stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

Copy-Item (Join-Path $Root "main.js") $Stage -Force
Copy-Item (Join-Path $Root "web.config") $Stage -Force
Copy-Item (Join-Path $Root "package.json") $Stage -Force
Copy-Item (Join-Path $Root ".env.example") $Stage -Force
New-Item -ItemType Directory -Force -Path (Join-Path $Stage ".next") | Out-Null
Copy-Item $Standalone (Join-Path $Stage ".next\standalone") -Recurse -Force

if (Test-Path $OutZip) { Remove-Item $OutZip -Force }
Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $OutZip -Force
Remove-Item $Stage -Recurse -Force

Write-Host ""
Write-Host "OK: $OutZip" -ForegroundColor Green
Write-Host "1) Upload + extract trên Plesk" -ForegroundColor Yellow
Write-Host "2) Tạo .env từ .env.example (đúng SITE_URL)" -ForegroundColor Yellow
Write-Host "3) Node.js Startup File = main.js → Enable / Restart" -ForegroundColor Yellow
