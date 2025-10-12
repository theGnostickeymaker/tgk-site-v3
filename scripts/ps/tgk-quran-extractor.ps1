<#
===============================================================================
🕋 TGK-Qur’an Extractor v1.1
-------------------------------------------------------------------------------
Purpose:
  Extracts structured Qur’an data from GlobalQuran’s `all.js` file into clean,
  language-specific JSONs for The Gnostic Key Vault.

Usage:
  pwsh -File "scripts\ps\tgk-quran-extractor.ps1" -Translation "en.yusufali"

Notes:
  - If -Translation is omitted, all available datasets will be exported.
  - The script auto-detects the `quran` key inside all.js.
===============================================================================
#>

param(
  [string] $Source = "C:\TGK\tgk-site-v3\site\upload\data\all.js",
  [string] $OutputRoot = "C:\TGK\tgk-site-v3\src\_data\quran",
  [string] $Translation = ""     # e.g. "en.yusufali" or "ur.jalandhry"
)

# --- Ensure output directory exists
if (-not (Test-Path $OutputRoot)) {
    New-Item -Path $OutputRoot -ItemType Directory -Force | Out-Null
}

Write-Host "📖 Extracting Qur’an data from: $Source"
Write-Host "📂 Output target: $OutputRoot"
if ($Translation) { Write-Host "🌐 Translation filter: $Translation" }

# --- Step 1: Read and strip wrapper
$content = Get-Content $Source -Raw
$jsonText = $content `
    -replace '^\s*\$.extend\(true,\s*gq.data,\s*', '' `
    -replace '\);\s*$', '' `
    -replace ';$', ''

# --- Step 2: Save full JSON snapshot
$fullJsonPath = Join-Path $OutputRoot "quran-data.json"
$jsonText | Out-File $fullJsonPath -Encoding utf8
Write-Host "✅ Full JSON exported to $fullJsonPath"

# --- Step 3: Parse JSON
try {
    $data = $jsonText | ConvertFrom-Json
} catch {
    Write-Host "❌ Failed to parse JSON — check syntax in all.js"
    exit
}

# --- Step 4: Extract translations
if ($null -ne $data.quran) {

    $keys = $data.quran.PSObject.Properties.Name
    if ($Translation) {
        $keys = $keys | Where-Object { $_ -eq $Translation }
        if (-not $keys) {
            Write-Host "⚠️ Translation '$Translation' not found."
            exit
        }
    }

    foreach ($key in $keys) {
        $translationData = $data.quran.$key
        $outFile = Join-Path $OutputRoot "$key.json"
        $translationData | ConvertTo-Json -Depth 12 | Out-File $outFile -Encoding utf8
        Write-Host "📦 Created: $key.json"
    }

    Write-Host "✨ Extraction complete."
} else {
    Write-Host "⚠️ No 'quran' key found in parsed data — please verify source file."
}
