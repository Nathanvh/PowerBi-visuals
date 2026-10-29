# Power BI visuals - haal de nieuwste .pbiviz-bestanden op van GitHub (zonder git).
# Gebruik (PowerShell, in een willekeurige map):  .\deploy.ps1
# Optioneel: .\deploy.ps1 -Doel D:\PowerBI\visuals   (standaard: map .\pbiviz naast dit script)
# Optioneel: .\deploy.ps1 -Visual kpikaart           (standaard: alle visuals)
# Vereist: een GitHub-token met leesrechten op Contents van deze repo (de repo is private).
#   Maak aan via GitHub: Settings > Developer settings > Fine-grained tokens > repository PowerBi-visuals > Contents: Read-only.
#   Tip: sla het eenmalig op voor jouw account:  [Environment]::SetEnvironmentVariable('GITHUB_TOKEN','<token>','User')
param(
    [string]$Doel = (Join-Path $PSScriptRoot 'pbiviz'),
    [string]$Visual,
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Repo = 'Nathanvh/PowerBi-visuals'
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Write-Host '1/3 Inloggen bij GitHub...'
if (-not $Token) {
    $secure = Read-Host 'GitHub-token' -AsSecureString
    $Token = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}
if (-not $Token) { throw 'Geen token opgegeven.' }
$json = @{ 'Authorization' = "Bearer $Token"; 'User-Agent' = 'deploy.ps1'; 'Accept' = 'application/vnd.github+json' }
$raw  = @{ 'Authorization' = "Bearer $Token"; 'User-Agent' = 'deploy.ps1'; 'Accept' = 'application/vnd.github.raw+json' }
$api  = "https://api.github.com/repos/$Repo/contents"

Write-Host '2/3 Visuals ophalen...'
try {
    $lijst = Invoke-RestMethod -Uri "$api/builds?ref=main" -Headers $json
} catch {
    throw "Kon de map builds niet ophalen. Klopt het token (leesrechten op Contents van $Repo)? Is de eerste build op GitHub (Actions) al klaar? Details: $($_.Exception.Message)"
}
$bestanden = $lijst | Where-Object { $_.name -like '*.pbiviz' }
if ($Visual) { $bestanden = $bestanden | Where-Object { $_.name -eq "$Visual.pbiviz" } }
if (-not $bestanden) { throw 'Geen .pbiviz-bestanden gevonden.' }

New-Item -ItemType Directory -Path $Doel -Force | Out-Null
foreach ($b in $bestanden) {
    $naam = [IO.Path]::GetFileNameWithoutExtension($b.name)
    $doelbestand = Join-Path $Doel $b.name
    Invoke-WebRequest -Uri $b.url -Headers $raw -OutFile $doelbestand
    $versie = '?'
    try { $versie = (Invoke-RestMethod -Uri "$api/visuals/$naam/pbiviz.json?ref=main" -Headers $raw).visual.version } catch { }
    Write-Host ("   {0}  versie {1}  ->  {2}" -f $b.name, $versie, $doelbestand)
}

Write-Host '3/3 Klaar.'
Write-Host "Importeer in Power BI Desktop via 'Importeren uit bestand' en bevestig dat de oude visual wordt vervangen."
