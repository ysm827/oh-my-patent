#requires -Version 3.0

<#
.SYNOPSIS
Installs the post-commit hook for oh-my-patent auto-push to GitHub.

.DESCRIPTION
- Detects the oh-my-patent repository (standalone or as a parent-repo subfolder)
- Copies the sync script into .git/hooks/ as post-commit (Windows .cmd wrapper)
- Creates a flag file (hook-source.txt) so the hook can trace and verify itself

.PARAMETER ohMyPatentDir
The root directory of the oh-my-patent project. If not specified, attempts to
auto-detect by checking the current directory and parent directories for
plugin.jsonc.

.PARAMETER standalone
If set, assumes oh-my-patent is a standalone repository (i.e., not a
submodule of /patents). This affects whether a parent-repo hook is offered.

.EXAMPLE
.\install-post-commit.ps1
  # Auto-detect oh-my-patent directory and install hook

.EXAMPLE
.\install-post-commit.ps1 -ohMyPatentDir "C:\Users\me\projects\oh-my-patent"
  # Specify project directory directly

.EXAMPLE
.\install-post-commit.ps1 -standalone
  # Treat as standalone repo
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string] $ohMyPatentDir,
    [switch] $standalone
)

function Find-OhMyPatentDir {
    <#
    Auto-detect by:
    1. checking if current directory == root with plugin.jsonc
    2. checking parent directories up to 5 levels for plugin.jsonc
    3. env var $env:OH_MY_PATENT_DIR
    #>
    if ($env:OH_MY_PATENT_DIR -and (Test-Path (Join-Path $env:OH_MY_PATENT_DIR 'plugin.jsonc'))) {
        return (Resolve-Path $env:OH_MY_PATENT_DIR).Path
    }

    $depth = 0
    $dir = (Get-Location).Path
    while ($depth -lt 5) {
        if (Test-Path (Join-Path $dir 'plugin.jsonc')) {
            return (Resolve-Path $dir).Path
        }
        $parent = Split-Path $dir -Parent
        if ($parent -eq $dir) { break }
        $dir = $parent
        $depth++
    }
    return $null
}

# --- 1. Resolve the oh-my-patent directory ---
if (-not $ohMyPatentDir) {
    $ohMyPatentDir = Find-OhMyPatentDir
    if (-not $ohMyPatentDir) {
        Write-Error "Cannot auto-detect oh-my-patent project. Please specify with -ohMyPatentDir.`nOr set environment variable: `$env:OH_MY_PATENT_DIR = '...'"
        exit 1
    }
}

# Normalize and validate
$ohMyPatentDir = (Resolve-Path $ohMyPatentDir).Path
$pluginJsonc = Join-Path $ohMyPatentDir 'plugin.jsonc'
if (-not (Test-Path $pluginJsonc)) {
    Write-Error "$ohMyPatentDir does not look like an oh-my-patent project (plugin.jsonc missing)!"
    exit 1
}

$gitDir = Join-Path $ohMyPatentDir '.git'
if (-not (Test-Path $gitDir)) {
    Write-Error "No .git directory found at $ohMyPatentDir. Is it initialized as a git repository?"
    exit 1
}

Write-Host "[install] oh-my-patent directory: $ohMyPatentDir" -ForegroundColor Cyan

# --- 2. Create the hook scripts directory ---
$hooksDir = Join-Path $gitDir 'hooks'
$null = New-Item -ItemType Directory -Force -Path $hooksDir

# --- 3. Install post-commit.js ---
$hookJsFile = Join-Path $hooksDir 'post-commit.js'
$hookSource = Join-Path (Join-Path $ohMyPatentDir 'scripts' 'hooks') 'post-commit.js'

if (-not (Test-Path $hookSource)) {
    Write-Error "Hook source script not found: $hookSource"
    exit 1
}

# Copy
Copy-Item -Path $hookSource -Destination $hookJsFile -Force -ErrorAction Stop
Write-Host "[install] Copied post-commit.js -> $hookJsFile"

# --- 4. Create .cmd wrapper (Git2Path-compatible) ---
# This allows `git commit` to trigger the hook on Windows, invoking `node`.
$hookCmdFile = Join-Path $hooksDir 'post-commit.cmd'
@'
@echo off
:: oh-my-patent auto-sync post-commit wrapper
::   commit message passed via %1 (not used here)
::   -- will cd to oh-my-patent directory, then execute the node script
set HOOKDIR=%~dp0
set SCRIPT=%HOOKDIR%post-commit.js

if not exist "%SCRIPT%" (
  echo [oh-my-patent] hook script missing: %SCRIPT%
  exit /b 1
)

cd /d "%HOOKDIR%..\.."
:: Execute `node` directly with no further arguments
node "%SCRIPT%"
'@ | Set-Content -Path $hookCmdFile -Encoding ASCII -Force -NoNewline
# Add trailing newline manually for clean files
'' | Add-Content -Path $hookCmdFile -Encoding ASCII
Write-Host "[install] Created post-commit.cmd -> $hookCmdFile" -ForegroundColor Green

# --- 5. Create hook-source.txt for traceability ---
$hookSourceMarker = Join-Path $hooksDir 'hook-source.txt'
"$(Get-Date -Format 's') :: installed from: $hookSource" | Set-Content -Path $hookSourceMarker -Encoding UTF8 -Force

# --- 6. Create parent-repo bridge (optional / suggested) ---
$gitConfigPath = (Join-Path $ohMyPatentDir '.git' 'config')
$isTraditionalGitRepo = (Test-Path (Join-Path $gitDir 'objects'))

if (-not $isTraditionalGitRepo) {
    # If it's a gitlink (a repository with .git as a file, not a dir),
    # then the hooks in the actual .git folder already exist, we are done.
    Write-Host "[info] .git appears to be a gitlink (dotgit file). Hook installed in the linked git dir, should work for standalone commits." -ForegroundColor Yellow
} else {
    Write-Host "[info] .git is a normal directory. Hook will trigger when committing from the oh-my-patent repo." -ForegroundColor Green
}

if (-not $standalone) {
    # Check if we're inside a parent repo with oh-my-patent as a folder or submodule
    $parentGitDir = (Git rev-parse --show-toplevel 2>$null)
    if ($?) {
        if ((Resolve-Path $parentGitDir) -and (Resolve-Path $parentGitDir).Path -ne (Resolve-Path $ohMyPatentDir).Path) {
            Write-Host ""
            Write-Host "[!] Parent repository detected: $parentGitDir" -ForegroundColor Yellow
            Write-Host "    By default, Git hooks only run on the repo where the commit is made." -ForegroundColor Yellow
            Write-Host "    If you commit in the parent /patents repo, a hook installed in .patents/.git/hooks/ will NOT trigger." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "    Options:" -ForegroundColor Cyan
            Write-Host "      1. 在母公司仓库安裝 sync 鉤子 (已寫入 install-parent-hook.ps1)." -ForegroundColor Cyan
            Write-Host "      2. 每次修改OhMyPatent后，主动进入 oh-my-patent 目錄执行 commit (推薦為了可追踪性及crisp commit)。" -ForegroundColor Cyan
            Write-Host "      3. 在 /patents 根目錄 commit，然后手动触发同步 (scripts/sync-oh-my-patent.ps1)。"
        }
    }
} else {
    Write-Host "[info] Standalone mode(-standalone). Only standalone commits within the repo will trigger auto-push." -ForegroundColor Green
}

Write-Host ""
Write-Host "[complete] oh-my-patent post-commit hook installed." -ForegroundColor Green
Write-Host "  Hook files:   $hookJsFile"
Write-Host "  cmd wrapper:  $hookCmdFile"
Write-Host "  Log path:     $(Join-Path $gitDir 'hook-sync.log')"
Write-Host ""
Write-Host "Test: cd $ohMyPatentDir; make a change, `git add -A`, `git commit -m "feat: test sync"`" -ForegroundColor Cyan
