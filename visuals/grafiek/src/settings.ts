"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class AlgemeenCard extends Card {
    modus = h.keuze("modus", "Kolommen", [{"value": "gestapeld", "displayName": "Gestapeld"}, {"value": "gegroepeerd", "displayName": "Naast elkaar"}], "gestapeld");
    legenda = h.schakel("legenda", "Legenda tonen", true);
    name = "algemeen";
    displayName = "Algemeen";
    slices: Slice[] = [this.modus, this.legenda];
}

class KolommenCard extends Card {
    breedte = h.num("breedte", "Breedte (0-1)", 0.6);
    radius = h.num("radius", "Hoekradius (px)", 2);
    labels = h.schakel("labels", "Waarden tonen", false);
    binnen = h.schakel("binnen", "Waarden in de kolom (uit = erboven)", true);
    totaal = h.schakel("totaal", "Totaal boven gestapelde kolom", true);
    mmss = h.schakel("mmss", "Waarden als m:ss (seconden)", false);
    notatie = h.tekst("notatie", "Notatie (leeg = formaat van het veld; bijv. 0, 0.0, #,0, 0%, m:ss)", "");
    name = "kolommen";
    displayName = "Kolommen";
    slices: Slice[] = [this.breedte, this.radius, this.labels, this.binnen, this.totaal, this.mmss, this.notatie];
}

class LijnCard extends Card {
    kleur = h.kleur("kleur", "Kleur", "#111987");
    dikte = h.num("dikte", "Dikte (px)", 2);
    punten = h.schakel("punten", "Punten tonen", true);
    labels = h.schakel("labels", "Waarden tonen", false);
    mmss = h.schakel("mmss", "Waarden als m:ss (seconden)", false);
    notatie = h.tekst("notatie", "Notatie (leeg = formaat van het veld; bijv. 0, 0.0, 0%, m:ss)", "");
    name = "lijn";
    displayName = "Lijn";
    slices: Slice[] = [this.kleur, this.dikte, this.punten, this.labels, this.mmss, this.notatie];
}

class ReeksCard extends Card {
    k1 = h.kleur("k1", "Reeks 1", "#111987");
    k2 = h.kleur("k2", "Reeks 2", "#66cccc");
    k3 = h.kleur("k3", "Reeks 3", "#dd7d32");
    k4 = h.kleur("k4", "Reeks 4", "#3650ff");
    k5 = h.kleur("k5", "Reeks 5", "#31959b");
    k6 = h.kleur("k6", "Reeks 6", "#c1561e");
    name = "reeks";
    displayName = "Kleuren van kolommen";
    slices: Slice[] = [this.k1, this.k2, this.k3, this.k4, this.k5, this.k6];
}

class AssenCard extends Card {
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9);
    kleur = h.kleur("kleur", "Tekstkleur", "#525252");
    raster = h.schakel("raster", "Rasterlijnen tonen", true);
    rasterKleur = h.kleur("rasterKleur", "Kleur rasterlijnen", "#E5E5E5");
    toonY = h.schakel("toonY", "Waardeas tonen", true);
    catNotatie = h.tekst("catNotatie", "Notatie categorieën (leeg = formaat van het veld; bijv. dd-MM, d mmmm)", "");
    name = "assen";
    displayName = "Assen";
    slices: Slice[] = [this.grootte, this.kleur, this.raster, this.rasterKleur, this.toonY, this.catNotatie];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    algemeen = new AlgemeenCard();
    kolommen = new KolommenCard();
    lijn = new LijnCard();
    reeks = new ReeksCard();
    assen = new AssenCard();
    lettertype = new LettertypeCard();
    cards = [this.algemeen, this.kolommen, this.lijn, this.reeks, this.assen, this.lettertype];
}
