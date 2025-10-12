<#
===============================================================================
🔮 TGK — Synergist Lens + Navigation Cascade Retrofit Utility (v4.0)
-------------------------------------------------------------------------------
Purpose:
  1. Copy seriesNav[] from series-level index.11tydata.js → each episode index.11tydata.js
  2. Copy episodeParts[] + seriesNav[] from episode index.11tydata.js → each scroll’s index.md
  3. Maintain Synergist Lens + vaultRefs consistency.
===============================================================================
#>

param(
  [Parameter(Mandatory=$false)]
  [string]$Root = "C:\TGK\tgk-site-v3"
)

# Initialize counters
[int]$navInjected = 0
Write-Host "🔍 Starting TGK Cascade Retrofit (v4.0)" -ForegroundColor Cyan
Write-Host "Root path: $Root" -ForegroundColor Cyan

# ---------------------------------------------------------------------
# Helper: Extract array from JS and reformat to YAML list
# ---------------------------------------------------------------------
function Convert-ToYamlList {
  param(
    [Parameter(Mandatory=$true)]
    [string]$ArrayBody,
    [Parameter(Mandatory=$true)]
    [string]$Label
  )
  if (-not $ArrayBody) { return "" }
  $objs = [regex]::Matches($ArrayBody, "{(.*?)}", "Singleline")
  if ($objs.Count -eq 0) { return "" }
  
  $out = @("${Label}:")
  foreach ($o in $objs) {
    $chunk = $o.Groups[1].Value
    $pairs = [regex]::Matches($chunk, '(?:"?(\w+)"?\s*:\s*(?:"([^"]*)"|''([^'']*)''|([^,}]+)))', "Singleline")
    $out += "  -"
    foreach ($p in $pairs) {
      $key = $p.Groups[1].Value
      $val = if ($p.Groups[2].Success) { $p.Groups[2].Value }
             elseif ($p.Groups[3].Success) { $p.Groups[3].Value }
             else { $p.Groups[4].Value.Trim() }
      $val = ($val -replace '\r?\n', ' ') -replace '"', '\"'
      $val = ($val -replace '{{\s*[^}]+\s*}}', '').Trim()
      if (-not $val) { continue }  # Skip empty or invalid values
      $out += "    {0}: ""{1}""" -f $key, $val
    }
  }
  return ($out -join "`n")
}

# ---------------------------------------------------------------------
# STEP 1 — Inject seriesNav into each episode index.11tydata.js
# ---------------------------------------------------------------------
try {
  $seriesPath = Join-Path $Root "src/pillars/the-teachings/the-afterlife"
  $seriesFiles = Get-ChildItem -Path $seriesPath -Recurse -Filter "index.11tydata.js" -ErrorAction Stop |
    Where-Object { $_.FullName -match "series-\d+[/\\]index\.11tydata\.js$" }

  if (-not $seriesFiles) {
    Write-Host "⚠️ No series files found in $seriesPath" -ForegroundColor Yellow
  }

  foreach ($series in $seriesFiles) {
    $seriesDir = Split-Path $series.FullName -Parent
    Write-Host "Processing series file: $($series.FullName)" -ForegroundColor Cyan
    try {
      $raw = Get-Content $series.FullName -Raw -ErrorAction Stop
      $snMatch = [regex]::Match($raw, "(?s)seriesNav\s*:\s*\[\s*\{.*?\}\s*\](,\s*|\s*};)", "Singleline")
      if (-not $snMatch.Success) { 
        Write-Host "⚠️ No seriesNav found in $($series.FullName)" -ForegroundColor Yellow
        continue 
      }
      $seriesNavBlock = $snMatch.Groups[0].Value -replace ",?\s*};$", ""  # Remove trailing }; if present
      Write-Host "📡 Found seriesNav in $seriesDir" -ForegroundColor Yellow

      # Find each episode dir under this series
      Get-ChildItem -Path $seriesDir -Directory -ErrorAction Stop | ForEach-Object {
        $epDir = $_.FullName
        $epData = Join-Path $epDir "index.11tydata.js"
        Write-Host "Checking episode file: $epData" -ForegroundColor Cyan
        if (Test-Path $epData -PathType Leaf) {
          try {
            $epRaw = Get-Content $epData -Raw -ErrorAction Stop
            Write-Host "   Before replacement (snippet):" -ForegroundColor Cyan
            Write-Host ($epRaw -split "`n" | Select-Object -First 10) -ForegroundColor Gray
            # Replace or append seriesNav
            if ($epRaw -match "seriesNav\s*:") {
              # Replace existing seriesNav, preserving trailing comma or closing brace
              $epRaw = [regex]::Replace($epRaw, "(?s)seriesNav\s*:\s*\[\s*\{.*?\}\s*\](,\s*|\s*};)", "$seriesNavBlock,`n$1")
            } else {
              # Append seriesNav before the closing brace, adding a comma and newline
              $epRaw = [regex]::Replace($epRaw, "(?s)\}\s*;\s*$", ",`n  $seriesNavBlock,`n};")
            }
            Set-Content -Path $epData -Value $epRaw -Encoding UTF8NoBOM -ErrorAction Stop
            Write-Host "   After replacement (snippet):" -ForegroundColor Cyan
            Write-Host ($epRaw -split "`n" | Select-Object -First 10) -ForegroundColor Gray
            Write-Host "   ↳ Injected seriesNav → $($_.Name)" -ForegroundColor Green
          } catch {
            Write-Host "⚠️ Failed to process $epData : $_" -ForegroundColor Red
          }
        } else {
          Write-Host "⚠️ Episode file not found: $epData" -ForegroundColor Yellow
        }
      }
    } catch {
      Write-Host "⚠️ Failed to process $series : $_" -ForegroundColor Red
    }
  }
} catch {
  Write-Host "⚠️ Error accessing series files: $_" -ForegroundColor Red
}

# ---------------------------------------------------------------------
# STEP 2 — For each scroll (index.md), inject episodeParts + seriesNav
# ---------------------------------------------------------------------
try {
  $scrollPath = Join-Path $Root "src/pillars/the-teachings/the-afterlife"
  Get-ChildItem -Path $scrollPath -Recurse -Filter "index.md" -ErrorAction Stop | ForEach-Object {
    $file = $_.FullName
    Write-Host "Processing scroll: $file" -ForegroundColor Cyan
    try {
      $raw = Get-Content $file -Raw -ErrorAction Stop
      $fmMatch = [regex]::Match($raw, "(?s)^---(.*?)---")
      if (-not $fmMatch.Success) {
        Write-Host "⚠️ No front matter found in $file" -ForegroundColor Yellow
        return
      }
      $fm = $fmMatch.Groups[1].Value
      $body = $raw.Substring($fmMatch.Length)

      # Find episode index.11tydata.js
      $episodeDir = Split-Path $file -Parent
      # Navigate up to episode level (e.g., from part-1 to gnostic-christianity)
      $episodeDir = Split-Path $episodeDir -Parent
      $epData = Join-Path $episodeDir "index.11tydata.js"
      if (-not (Test-Path $epData -PathType Leaf)) {
        Write-Host "⚠️ No episode data found for $file at $epData" -ForegroundColor Yellow
        return
      }

      $epRaw = Get-Content $epData -Raw -ErrorAction Stop
      $epMatch = [regex]::Match($epRaw, "(?s)episodeParts\s*:\s*\[(.*?)\]", "Singleline")
      $snMatch = [regex]::Match($epRaw, "(?s)seriesNav\s*:\s*\[(.*?)\]", "Singleline")
      $episodePartsYaml = if ($epMatch.Success) { Convert-ToYamlList $epMatch.Groups[1].Value "episodeParts" } else { "" }
      $seriesNavYaml = if ($snMatch.Success) { Convert-ToYamlList $snMatch.Groups[1].Value "seriesNav" } else { "" }
      if (-not ($episodePartsYaml -or $seriesNavYaml)) {
        Write-Host "⚠️ No episodeParts or seriesNav found for $file" -ForegroundColor Yellow
        return
      }

      # Remove previous navigation block
      $fm = [regex]::Replace($fm, "(?s)#\s*🔗\s*Auto-injected navigation.*?(?=(?:\r?\n\r?\nlensEnabled:)|\Z)", "")

      $navBlock = "# 🔗 Auto-injected navigation (v4.0)`n$episodePartsYaml`n`n$seriesNavYaml`n"
      $updatedFM = ($fm.TrimEnd() + "`n`n" + $navBlock).Trim() + "`n"
      $new = "---`n$updatedFM---$body"
      Set-Content -Path $file -Value $new -Encoding UTF8NoBOM -ErrorAction Stop
      Write-Host "✅ Updated scroll → $file" -ForegroundColor Green
      $navInjected++
    } catch {
      Write-Host "⚠️ Failed to process $file : $_" -ForegroundColor Red
    }
  }
} catch {
  Write-Host "⚠️ Error accessing scroll files: $_" -ForegroundColor Red
}

# ---------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------
Write-Host ""
Write-Host "📈 Cascade Retrofit Summary" -ForegroundColor Magenta
Write-Host "───────────────────────────────"
Write-Host ("📘 Nav blocks injected: {0}" -f $navInjected)
Write-Host "───────────────────────────────"
Write-Host "🎯 Complete." -ForegroundColor Green