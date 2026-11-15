# Install jod's portable skills for AI coding tools other than Claude Code (Windows PowerShell).
# (Claude Code: use the plugin instead: /plugin marketplace add l3lackcurtains/jod)
#
#   irm https://raw.githubusercontent.com/l3lackcurtains/jod/main/install.ps1 | iex
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/l3lackcurtains/jod/main/install.ps1))) -Targets agents,zcode
#
# Targets (default: agents): agents, zcode, claude, cursor, opencode, copilot, gemini, all (= agents + zcode)
# -Project installs into the current repo instead of your home folder.
param(
  [string[]]$Targets = @('agents'),
  [switch]$Project
)
$ErrorActionPreference = 'Stop'
$repo = 'l3lackcurtains/jod'

function Get-SkillDir([string]$target) {
  $base = if ($Project) { (Get-Location).Path } else { $HOME }
  switch ($target) {
    'agents'   { Join-Path $base '.agents\skills' }
    'zcode'    { Join-Path $base '.zcode\skills' }
    'claude'   { Join-Path $base '.claude\skills' }
    'cursor'   { Join-Path $base '.cursor\skills' }
    'opencode' { if ($Project) { Join-Path $base '.opencode\skills' } else { Join-Path $HOME '.config\opencode\skills' } }
    'copilot'  { if ($Project) { Join-Path $base '.github\skills' } else { Join-Path $HOME '.copilot\skills' } }
    'gemini'   { Join-Path $base '.gemini\skills' }
    default    { throw "unknown target: $target" }
  }
}

$expanded = foreach ($t in $Targets) { if ($t -eq 'all') { 'agents'; 'zcode' } else { $t } }

# Source: this checkout if run from it, otherwise a fresh download of main.
$tmp = $null
if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot 'portable'))) {
  $src = Join-Path $PSScriptRoot 'portable'
} else {
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("jod-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $tmp | Out-Null
  $zip = Join-Path $tmp 'jod.zip'
  Invoke-WebRequest "https://github.com/$repo/archive/refs/heads/main.zip" -OutFile $zip -UseBasicParsing
  Expand-Archive $zip -DestinationPath $tmp
  $src = Join-Path $tmp 'jod-main\portable'
}

try {
  $skills = Get-ChildItem $src -Directory -Filter 'jod-*'
  foreach ($t in $expanded) {
    $dest = Get-SkillDir $t
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
    foreach ($s in $skills) {
      $target = Join-Path $dest $s.Name
      if (Test-Path $target) { Remove-Item $target -Recurse -Force }
      Copy-Item $s.FullName $target -Recurse
    }
    Write-Host "jod: installed $($skills.Count) skills -> $dest"
  }
  Write-Host 'jod: next, run /jod-setup (or ask your agent to use the jod-setup skill) in your repo.'
} finally {
  if ($tmp) { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}
