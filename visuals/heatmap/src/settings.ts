"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class KleurenCard extends Card {
    laag = h.kleur("laag", "Laag", "#e9f1ff");
    midden = h.kleur("midden", "Midden", "#9fb4ff");
    hoog = h.kleur("hoog", "Hoog", "#111987");
    leeg = h.kleur("leeg", "Lege cel", "#F5F5F5");
    tekstDonker = h.kleur("tekstDonker", "Tekst op lichte cel", "#262626");
    tekstLicht = h.kleur("tekstLicht", "Tekst op donkere cel", "#FFFFFF");
    drempel = h.num("drempel", "Wisselpunt tekstkleur (0-1)", 0.5);
    name = "kleuren";
    displayName = "Kleuren";
    slices: Slice[] = [this.laag, this.midden, this.hoog, this.leeg, this.tekstDonker, this.tekstLicht, this.drempel];
}

class CellenCard extends Card {
    toonWaarden = h.schakel("toonWaarden", "Waarden tonen", true);
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9.75);
    vet = h.schakel("vet", "Vet", false);
    ruimte = h.num("ruimte", "Ruimte tussen cellen (px)", 4);
    radius = h.num("radius", "Hoekradius (px)", 4);
    nullAlsLeeg = h.schakel("nullAlsLeeg", "0 tonen als leeg", false);
    notatie = h.tekst("notatie", "Notatie (leeg = formaat van het veld; bijv. 0, 0.0, 0%, m:ss)", "");
    name = "cellen";
    displayName = "Cellen";
    slices: Slice[] = [this.toonWaarden, this.grootte, this.vet, this.ruimte, this.radius, this.nullAlsLeeg, this.notatie];
}

class KoppenCard extends Card {
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9);
    kleur = h.kleur("kleur", "Kleur", "#111987");
    vet = h.schakel("vet", "Vet", true);
    rijkopBreedte = h.num("rijkopBreedte", "Breedte rijkop (px, 0 = automatisch)", 0);
    name = "koppen";
    displayName = "Koppen";
    slices: Slice[] = [this.grootte, this.kleur, this.vet, this.rijkopBreedte];
}

class LegendaCard extends Card {
    toon = h.schakel("toon", "Tonen", false);
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9);
    kleur = h.kleur("kleur", "Kleur", "#525252");
    name = "legenda";
    displayName = "Legenda";
    slices: Slice[] = [this.toon, this.grootte, this.kleur];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    kleuren = new KleurenCard();
    cellen = new CellenCard();
    koppen = new KoppenCard();
    legenda = new LegendaCard();
    lettertype = new LettertypeCard();
    cards = [this.kleuren, this.cellen, this.koppen, this.legenda, this.lettertype];
}
