# Power BI visuals - update de server naar de laatste versie op GitHub.
# Gebruik (PowerShell, in de projectmap):  .\deploy.ps1
# Optioneel: .\deploy.ps1 -Doel D:\PowerBI\visuals   (kopieert de .pbiviz-bestanden ook naar die map)
# Vereist: git. Node.js is NIET nodig: de gebouwde .pbiviz-bestanden staan klaar in de map builds\.
param([string]$Doel)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '1/3 Code ophalen...'
git pull --ff-only
if ($LASTEXITCODE -ne 0) { throw 'git pull mislukt (lokale wijzigingen op de server?). Controleer: git status' }

Write-Host '2/3 Visuals controleren...'
$bestanden = Get-ChildItem (Join-Path $PSScriptRoot 'builds') -Filter *.pbiviz -ErrorAction SilentlyContinue
if (-not $bestanden) { throw 'Geen .pbiviz-bestanden in builds\. Wacht tot de build op GitHub (Actions) klaar is en probeer opnieuw.' }
foreach ($b in $bestanden) {
    $versie = (Get-Content (Join-Path $PSScriptRoot "visuals\$($b.BaseName)\pbiviz.json") -Raw | ConvertFrom-Json).visual.version
    Write-Host ("   {0}  versie {1}  ({2:yyyy-MM-dd HH:mm})" -f $b.Name, $versie, $b.LastWriteTime)
    if ($Doel) {
        New-Item -ItemType Directory -Path $Doel -Force | Out-Null
        Copy-Item $b.FullName (Join-Path $Doel $b.Name) -Force
    }
}

Write-Host '3/3 Klaar.'
if ($Doel) { Write-Host "Bestanden gekopieerd naar $Doel." } else { Write-Host "Bestanden staan in: $(Join-Path $PSScriptRoot 'builds')" }
Write-Host "Importeer in Power BI Desktop via 'Importeren uit bestand' en bevestig dat de oude visual wordt vervangen."
