# Power BI visuals – huisstijl 3CX-rapportage

Eén repository met alle eigen Power BI custom visuals. Elke visual heeft een eigen map onder `visuals/`.
Dit bestand is ook de opdracht voor Claude: bij een nieuwe visual gelden de afspraken hieronder **altijd**,
zonder dat ze opnieuw uitgelegd hoeven te worden.

## Visuals

Gedeelde huisstijlcode (kleuren, opmaak, m:ss, kleurverloop) staat in `shared/huisstijl.ts` en wordt door alle visuals gebruikt.

| Map | Visual in Power BI | Gebruik in de dashboards |
|---|---|---|
| `visuals/paginatitel` | Paginatitel 3CX | Titel, ondertitel en oranje lijn bovenaan elke pagina (1232 x 80) |
| `visuals/kpikaart` | KPI-kaart 3CX | De grote kaarten (165 x 108); vaste ruimte voor label en toelichting, zodat alle kaarten gelijk staan |
| `visuals/kleinekaart` | Kleine kaart 3CX | De kleine kaarten (299 x 64): label en toelichting links, waarde rechts |
| `visuals/slicer` | Slicer tegels 3CX | Entiteit, Wachtrij, Weekdag, Medewerker (tegels, meerdere selecteren, Alles-tegel) |
| `visuals/datumslicer` | Datumslicer 3CX | Datum: *Van - tot met vorige/volgende* (standaard, dashboard 1), *Bereik* of *Eén dag* (dashboard 2); Algemeen, Modus |
| `visuals/grafiek` | Kolom- en lijngrafiek 3CX | Gestapelde kolommen per dag, lijn voor wachttijd, wachtklasse-grafiek |
| `visuals/heatmap` | Heatmap 3CX | Weekdag x uur (wachtrij) en medewerker x uur; cellen vullen de hele visual |
| `visuals/tabel` | Tabel 3CX | Gemiste gesprekken, opnamegedrag (databalk), detailtabel, per-wachtrij-tabel met totaalrij |

Niet vervangen (blijft standaard Power BI): de uitklapbare matrix "Wie nam wat op" (hiërarchie met uitklappen).

### Velden per visual

- **Paginatitel:** *Titel* en *Ondertitel* als tekst-measure, of vaste tekst bij Format visual.
- **KPI-kaart en Kleine kaart:** *Waarde* (measure), *Toelichting* (tekst-measure, optioneel; of een vaste tekst typen bij Format visual), *Accentkleur* (measure met hexcode, optioneel).
- **Slicer tegels / Datumslicer:** één veld. De visual stuurt zelf een filter naar de andere visuals op de pagina.
- **Kolom- en lijngrafiek:** *Categorie (as)*, *Kolommen* (één of meer measures, bijvoorbeeld Opgenomen, Terugbel, Gemist), *Lijn* (één measure, komt op een tweede as als er ook kolommen zijn).
- **Heatmap:** *Rijen*, *Kolommen*, *Waarde*.
- **Tabel:** alle kolommen in *Kolommen*. Speciale kolommen via Format visual, *Speciale kolommen* (m:ss, databalk, statuskleuren).

**Notatie van waarden:** elke visual gebruikt het formaat van het veld. Wil je dat overschrijven, typ dan een notatiecode:
`0`, `0.0`, `0.00`, `#,0` (duizendtallen), `0%`, `0.0%`; duur in seconden: `m:ss` of `h:mm:ss`; datums: `dd-MM-yyyy`, `dd-MM`, `HH:mm`.
Kaart: *Waarde, Notatie*. Heatmap: *Cellen, Notatie*. Grafiek: *Kolommen/Lijn, Notatie* en *Assen, Notatie categorieën*.
Tabel: *Speciale kolommen, Notatie per kolom* in de vorm `Gesprekken=#,0; Opname %=0.0%`. Kolomnamen zijn de namen in de kolomkop (hernoem het veld in het veldenvak als je een andere naam wilt).

Bekende beperkingen: een custom visual kan niet buiten zijn eigen vlak tekenen, dus slicers zijn tegels en geen uitklapmenu.
Interactie (klikken in een grafiek om andere visuals te filteren) en tooltips van Power BI zelf zitten er niet in; wel eenvoudige hover-tekst.

## Downloaden en installeren

1. Ga naar **Releases** en download het `.pbiviz`-bestand van de gewenste visual (onder *Assets*).
   Een tussentijdse build staat bij **Actions**, laatste run, onder *Artifacts*.
2. Power BI Desktop: *Visualisaties, drie puntjes, Meer visuals, Importeren uit bestand*.
3. De visual zit dan in dat rapport. Voor een ander rapport opnieuw importeren.

Nieuwe versie van een bestaande visual: importeer het bestand opnieuw en bevestig dat de oude wordt vervangen.

### Ophalen op een server (PowerShell, zonder git)

Na elke push zet de build de gebouwde bestanden in `builds/<naam>.pbiviz`. `deploy.ps1` haalt die op via de GitHub-API.
Kopieer het script naar de server (of download het uit de repo) en draai het:

```powershell
.\deploy.ps1                                   # alle visuals naar .\pbiviz
.\deploy.ps1 -Visual kpikaart -Doel D:\PowerBI\visuals
```

Nodig: een fine-grained GitHub-token met *Contents: Read-only* op deze repo (private). Het script vraagt erom, of leest
de omgevingsvariabele `GITHUB_TOKEN`. Geen git of Node.js nodig. Bij een uitvoeringsbeleid-melding:
`powershell -ExecutionPolicy Bypass -File .\deploy.ps1`.

## Werkwijze voor wijzigingen

- Wijzigingen gaan naar `main`. Elke push bouwt alle visuals (GitHub Actions).
- Een versie uitbrengen: verhoog het versienummer in `visuals/<naam>/pbiviz.json` (`visual.version` en `version`, vier delen, bijvoorbeeld `1.0.2.0`).
  Na de push maakt de workflow zelf de tag `<naam>-v<versie>` (bijvoorbeeld `kpikaart-v1.0.2`) en een Release met het `.pbiviz`-bestand.
  Is de versie niet verhoogd, dan wordt er alleen gebouwd en geen Release gemaakt.
- Lokaal bouwen: `cd visuals/<naam> && npm ci && npx pbiviz package` (bestand komt in `dist/`).

## Een nieuwe visual toevoegen

1. Maak `visuals/<naam>/` met een eigen `package.json` en `package-lock.json`. Begin bij voorkeur als kopie van `visuals/kpikaart`.
2. `package.json` moet `powerbi-visuals-tools` (vaste versie) als devDependency hebben en een naam gelijk aan de mapnaam.
3. In `pbiviz.json`: uniek `guid`, `displayName` in het Nederlands, `author` Bevico en `supportUrl` (anders weigert `pbiviz package`).
4. Voeg de visual toe aan de tabel hierboven. De workflow pakt nieuwe mappen automatisch mee.

## Huisstijl (verplicht voor elke visual)

Bron: de huisstijl-CSS van Bevico. Het Power BI-thema staat in `theme/huisstijl_powerbi_thema.json`.

**Lettertype:** Montserrat (instelbaar, met terugval op Segoe UI, Arial). Koppen en getallen gewicht 800, labels 400.

**Kleuren**

| Gebruik | Kleur |
|---|---|
| Hoofdkleur (waarden, titels) | `#111987` (marine) |
| Donker accent | `#0c0f5a` |
| Accent oranje (gemist, lijnen) | `#dd7d32`, donkerder `#c1561e` |
| Accent turquoise (terugbellen) | `#66cccc`, donkerder `#31959b` |
| Lichtblauw (heatmap laag, chips) | `#e9f1ff` |
| Middenblauw (heatmap midden) | `#9fb4ff` |
| Tekst | `#262626`, secundair `#525252` |
| Kaartrand | `#E5E5E5` |
| Paginabackground | `#FAFAFA`, kaartbackground `#FFFFFF` |
| Neutrale accentbalk | `#D4D4D4` |
| Goed / neutraal / slecht | `#039654` / `#f78f08` / `#d92d20` |

Reeks voor grafieken: `#111987, #dd7d32, #66cccc, #3650ff, #31959b, #c1561e, #9fb4ff, #525252`.

**Vormen:** hoekradius 8 px (kleinere elementen 6 px), rand 1 px `#E5E5E5`, witte kaart op `#FAFAFA`. Accentbalk 4 px bovenaan de kaart.

**Lettergroottes** staan in **pt** (Power BI werkt in pt, niet in px; 1 pt = 1,333 px).
Beschikbare waarden in Power BI: 8, 9, 9.75, 10, 10.5, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40.

| Onderdeel | pt |
|---|---|
| Paginatitel | 24 |
| Grote kaartwaarde | 24 |
| Kleine kaartwaarde | 16 |
| Visualtitel | 12 |
| Slicerwaarde, tabelkop | 10.5 |
| Tabeltekst, ondertitel | 9.75 |
| Labels, toelichting, assen | 9 |

**Opvulling en ruimte (px):** pagina 1280 breed met marge 24 (inhoud 1232); ruimte tussen visuals 16 (tussen kaarten en slicers 12);
visual-padding 20 (kleine kaarten 12 / 16); ruimte onder een visualtitel 12; tabelrij-padding 8; kolomruimte 12.
Standaard kaartmaat: 165 × 108 (zeven naast elkaar), kleine kaart 299 × 64.

## Afspraken voor de code van een visual

- **Alles Nederlands** in het Format-paneel (displayName) en in foutmeldingen.
- **Regelhoogte is altijd instelbaar** per tekstregel (standaard 1,1 voor getallen, 1,2 voor tekst). Dit was het grootste probleem met de standaardkaart.
- **Instelbaar, met standaardwaarden uit de huisstijl:** kleuren, tekstgrootte in pt, padding, ruimte tussen regels, hoekradius, rand, achtergrond, lettertype.
- **Tekst afbreken** als schakelaar (standaard aan) zodat labels niet afgekapt worden.
- **Dynamische kleur via een measure** die een hexcode teruggeeft (rol *Accentkleur*), met een vaste standaardkleur als terugval.
- **Getallen opmaken** met nl-NL en het formaat van de measure (bijv. `0%`); tekstmeasures worden ongewijzigd getoond.
- **Geen externe verbindingen** en geen tracking in een visual. Alleen lokaal renderen.
- Een visual is een eigen iframe: slepen binnen de visual verplaatst hem niet. Verplaatsen kan aan de rand, met de pijltoetsen of via *Format visual, Algemeen, Eigenschappen*.

## Data en bron

De rapporten draaien op de SQL Server-views `rapport.vw_cdr_gesprek`, `rapport.vw_cdr_gemist` en `rapport.vw_cdr_medewerker_dag`
(bron: 3CX `public_cdroutput`). Datumtabel: `_dim datum`. Hoofdmeasure: `[QueueGesprekken]`.
Eigen measures horen bij de visuals die ze voeden; een visual zelf bevat geen datalogica.
