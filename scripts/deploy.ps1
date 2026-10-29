<#
.SYNOPSIS
    Haalt de nieuwste .pbiviz-bestanden uit de GitHub-Releases op en zet ze in een map op deze server.

.DESCRIPTION
    Zoekt per visual de nieuwste Release (tag <visual>-v<versie>) in Nathanvh/PowerBi-visuals en
    downloadt het .pbiviz-bestand. Bestaat dezelfde versie al in de doelmap, dan wordt hij overgeslagen.
    Voor een private repo is een token nodig met leesrechten op Contents/Releases
    (GitHub, Settings, Developer settings, Fine-grained token, repository Nathanvh/PowerBi-visuals, Contents: Read-only).

.PARAMETER Visual
    Naam van de visual (mapnaam onder visuals/), bijvoorbeeld kpikaart. Leeg = alle visuals.

.PARAMETER Doel
    Doelmap voor de bestanden. Standaard .\pbiviz naast dit script.

.PARAMETER Token
    GitHub-token. Standaard uit omgevingsvariabele GITHUB_TOKEN; anders wordt er om gevraagd.

.PARAMETER Versie
    Een specifieke versie ophalen in plaats van de nieuwste, bijvoorbeeld 1.0.1.

.EXAMPLE
    .\deploy.ps1
    .\deploy.ps1 -Visual kpikaart -Doel D:\PowerBI\visuals
    .\deploy.ps1 -Visual kpikaart -Versie 1.0.1

.NOTES
    Direct vanaf GitHub uitvoeren (PowerShell, private repo):
    $h = @{ Authorization = "Bearer $env:GITHUB_TOKEN"; Accept = 'application/vnd.github.raw+json' }
    irm 'https://api.github.com/repos/Nathanvh/PowerBi-visuals/contents/scripts/deploy.ps1' -Headers $h -OutFile deploy.ps1
#>
[CmdletBinding()]
param(
    [string]$Visual,
    [string]$Doel = (Join-Path $PSScriptRoot 'pbiviz'),
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Versie,
    [string]$Repo = 'Nathanvh/PowerBi-visuals'
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = 'SilentlyContinue'

if (-not $Token) {
    $secure = Read-Host 'GitHub-token (leeg laten voor een publieke repo)' -AsSecureString
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

$headers = @{ 'User-Agent' = 'deploy.ps1'; 'X-GitHub-Api-Version' = '2022-11-28' }
if ($Token) { $headers['Authorization'] = "Bearer $Token" }

New-Item -ItemType Directory -Path $Doel -Force | Out-Null

Write-Host "Releases ophalen uit $Repo ..."
$releases = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases?per_page=100" -Headers $headers |
    Where-Object { -not $_.draft -and -not $_.prerelease }

# Tag <visual>-v<versie>  ->  visual + versie
$items = foreach ($r in $releases) {
    if ($r.tag_name -match '^(?<visual>.+)-v(?<versie>\d+(\.\d+){1,3})$') {
        [pscustomobject]@{
            Visual  = $Matches.visual
            Versie  = [version]$Matches.versie
            Release = $r
        }
    }
}
if (-not $items) { throw "Geen releases gevonden in $Repo. Is er al een versie uitgebracht, en heeft het token leesrechten?" }

$visuals = if ($Visual) { @($Visual) } else { $items.Visual | Sort-Object -Unique }

foreach ($v in $visuals) {
    $kandidaten = $items | Where-Object { $_.Visual -eq $v }
    if ($Versie) { $kandidaten = $kandidaten | Where-Object { $_.Versie -eq [version]$Versie } }
    $gekozen = $kandidaten | Sort-Object Versie -Descending | Select-Object -First 1
    if (-not $gekozen) { Write-Warning "Geen release gevonden voor '$v'."; continue }

    $asset = $gekozen.Release.assets | Where-Object { $_.name -like '*.pbiviz' } | Select-Object -First 1
    if (-not $asset) { Write-Warning "Release $($gekozen.Release.tag_name) bevat geen .pbiviz-bestand."; continue }

    $doelbestand = Join-Path $Doel ("{0}-{1}.pbiviz" -f $v, $gekozen.Versie)
    if (Test-Path $doelbestand) {
        Write-Host "$v $($gekozen.Versie): al aanwezig, overgeslagen."
    } else {
        $dl = $headers.Clone()
        $dl['Accept'] = 'application/octet-stream'
        Invoke-WebRequest -Uri $asset.url -Headers $dl -OutFile $doelbestand
        Write-Host "$v $($gekozen.Versie): gedownload naar $doelbestand"
    }
    # Vaste bestandsnaam zonder versie, zodat je altijd dezelfde naam kunt importeren
    Copy-Item $doelbestand (Join-Path $Doel "$v.pbiviz") -Force
}

Write-Host "Klaar. Importeer in Power BI Desktop via 'Importeren uit bestand'."
