param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^\d+\.\d+\.\d+$')]
  [string]$Version
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $projectRoot "data/app-version.js"
$versionSource = "export const APP_VERSION = `"$Version`";`r`n"
[System.IO.File]::WriteAllText($versionFile, $versionSource, [System.Text.UTF8Encoding]::new($false))

$sourceFiles = @(
  Get-ChildItem -LiteralPath (Join-Path $projectRoot "src") -Recurse -File -Filter "*.js"
  Get-Item -LiteralPath $versionFile
  Get-Item -LiteralPath (Join-Path $projectRoot "index.html")
)

foreach ($file in $sourceFiles) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  $content = [regex]::Replace($content, '(from\s+["''])([^"'']+\.js)(?:\?v=[^"'']*)?(["''])', ('$1$2?v=' + $Version + '$3'))
  $content = [regex]::Replace($content, '((?:src|href)=["''][^"'']+\.(?:js|css))(?:\?v=[^"'']*)?(["''])', ('$1?v=' + $Version + '$2'))
  $content = [regex]::Replace($content, '(assets/male-01-portrait\.png)(?:\?v=[^"''\s]*)?', ('$1?v=' + $Version))
  $content = [regex]::Replace($content, '(name=["'']app-version["'']\s+content=["''])[^"'']*(["''])', ('$1' + $Version + '$2'))
  $content = [regex]::Replace($content, '(<span class=["'']rail-date["'']>)[^<]*(</span>)', ('$1v' + $Version + '$2'))
  [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
}

Write-Host "Cache keys updated to v$Version."
