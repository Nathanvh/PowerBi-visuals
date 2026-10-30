# Dashboards bouwen met native Power BI-visuals

Vooraf: importeer `theme/huisstijl_powerbi_thema.json` (Weergave, Thema's, Door een thema bladeren). Het thema zet Montserrat, kleuren, kaartranden (8 px), titels, assen, tabellen en slicers (dropdown) klaar. Alles hieronder is dan alleen wat het thema niet kan.
Pagina: 1280 x 720 (Pagina-instellingen, Aangepast), achtergrond staat via het thema op #FAFAFA.

## Slicers (alle dashboards)

| Slicer | Veld | Stijl |
|---|---|---|
| Periode | `_dim datum`[Datum] | Slicer-instelling *Tussen* (met schuifbalk uit) of *Relatieve datum* |
| Entiteit | Entiteit | Dropdown |
| Wachtrij | Wachtrij | Dropdown, zoekvak aan (Slicer-instellingen, Zoeken inschakelen) |
| Weekdag | Weekdag | Tegels (Opmaak, Slicer-instellingen, Stijl: Tegel), horizontaal |

1. Edit interactions: de slicers Entiteit en Wachtrij moeten elkaar filteren. Selecteer Entiteit, Weergave, *Interacties bewerken*, en zet het filter-icoon op Wachtrij aan.
2. Een slicer toont alleen wachtrijen die bij de gekozen entiteit horen als de velden in dezelfde (of gerelateerde) tabel staan. Staan ze in `Gesprek`, dan werkt dit direct.
3. Sorteer Weekdag via *Sorteren op kolom* (weekdagnummer), anders staat de lijst alfabetisch.

## KPI-kaarten (zeven naast elkaar, 165 x 108)

1. Visual: *Kaart* (nieuwe kaart of oude kaart).
2. Waarde: de measure. Formaat via Measure-hulpmiddelen (bijv. `0%`).
3. Categorielabel: aan, 9 pt, grijs `#525252`. Waarde 24 pt, `#111987`.
4. Toelichting: een tweede veld in de nieuwe kaart (referentielabel), of een tekstvak eronder.
5. Accentbalk: een rechthoek (Invoegen, Vormen) van 165 x 4 px bovenaan, kleur `#111987`, `#dd7d32` of `#66cccc`.

## Tabel

1. Visual: *Tabel*. Kolomkoppen en rijen komen uit het thema.
2. Databalken per kolom: Visual, Cellen-elementen, kies de kolom, *Databalken* aan, *Instellingen*: positieve balk kleur kiezen (herhaal per kolom met eigen kleur).
3. Kleur per status: Cellen-elementen, *Achtergrondkleur*, fx, regels (Beantwoord = `#039654`, Gemist = `#d92d20`).
4. Seconden als m:ss: maak een measure met `FORMAT(TIME(0, 0, [sec]), "m:ss")` of zet het kolomformaat op `h:mm:ss`.
5. Totaalrij: Totalen aan. Percentage-kolommen: gebruik een ratio-measure zodat het totaal klopt.

## Grafiek: kolom + lijn

1. Visual: *Gestapelde kolom en lijndiagram* (of *Geclusterde kolom en lijn*).
2. Waarden in de kolommen: Visual, Gegevenslabels aan, Opties: Positie *Binnenin midden*, kleur wit, 9 pt.
3. Datumformaat: Visual, X-as, Type *Categorisch* (bij een datum). Het formaat volgt de kolom (Tabelweergave, kolom, Gegevensindeling, Aangepast `d mmmm`).
4. Kleuren: komen uit het thema. Lijn: Visual, Lijnen, `#dd7d32`, 2 px.
5. Legenda: boven (thema).

## Heatmap

1. Visual: *Matrix*. Rijen = uur, kolommen = weekdag, Waarden = gesprekken.
2. Cellen-elementen, Achtergrondkleur, fx: kleurverloop minimum `#e9f1ff`, midden `#9fb4ff`, maximum `#111987`.
3. Lettertekst wit boven de helft (extra fx-regel op Tekstkleur: groter dan 50% van max = `#FFFFFF`).
4. Subtotalen en Totalen uit.

## Paginatitel

Gewoon een *Tekstvak*: titel Montserrat 24 pt, `#111987`, vet. Daaronder een tekstvak 9,75 pt `#525252` en een lijn. Wil je de titel dynamisch, gebruik een *Kaart* met een measure en zet het label uit.

## Samen kopiëren

Bouw een pagina één keer goed, dupliceer hem (rechtsklik op het paginatabblad, *Pagina dupliceren*) en vervang alleen de velden.
