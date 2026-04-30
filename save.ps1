param(
  [Parameter(Mandatory = $false)]
  [string]$Message = "Project checkpoint"
)

$ErrorActionPreference = "Stop"

git add .

$pending = git status --short
if (-not $pending) {
  Write-Host "No changes to save."
  exit 0
}

git commit -m $Message
git status --short
