"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class TekstCard extends Card {
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9.75);
    kleur = h.kleur("kleur", "Kleur", "#262626");
    rijPadding = h.num("rijPadding", "Rij-padding boven/onder (px)", 8);
    kolomRuimte = h.num("kolomRuimte", "Ruimte tussen kolommen (px)", 12);
    scheiding = h.kleur("scheiding", "Kleur rijlijn", "#F0F0F0");
    zebra = h.schakel("zebra", "Om-en-om rijkleur", false);
    zebraKleur = h.kleur("zebraKleur", "Kleur om-en-om", "#FAFAFA");
    sorteren = h.schakel("sorteren", "Sorteren door op kop te klikken", true);
    name = "tekst";
    displayName = "Tekst";
    slices: Slice[] = [this.grootte, this.kleur, this.rijPadding, this.kolomRuimte, this.scheiding, this.zebra, this.zebraKleur, this.sorteren];
}

class KopCard extends Card {
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9);
    kleur = h.kleur("kleur", "Kleur", "#111987");
    vet = h.schakel("vet", "Vet", true);
    lijnKleur = h.kleur("lijnKleur", "Kleur onderlijn", "#111987");
    lijnDikte = h.num("lijnDikte", "Dikte onderlijn (px)", 2);
    name = "kop";
    displayName = "Kolomkoppen";
    slices: Slice[] = [this.grootte, this.kleur, this.vet, this.lijnKleur, this.lijnDikte];
}

class TotaalCard extends Card {
    toon = h.schakel("toon", "Tonen", false);
    label = h.tekst("label", "Label", "Totaal");
    uitsluiten = h.tekst("uitsluiten", "Kolommen zonder totaal (namen, komma; %-kolommen sowieso niet)", "");
    name = "totaal";
    displayName = "Totaalrij";
    slices: Slice[] = [this.toon, this.label, this.uitsluiten];
}

class OpmaakCard extends Card {
    mmss = h.tekst("mmss", "Kolommen als m:ss (namen, komma; waarde in seconden)", "");
    databalk = h.tekst("databalk", "Kolom met databalk (naam)", "");
    databalkKleur = h.kleur("databalkKleur", "Kleur databalk", "#9fb4ff");
    statusKleuren = h.tekst("statusKleuren", "Statuskleuren (Tekst=#kleur; gescheiden door ;)", "Gemist=#dd7d32;Beantwoord=#111987;Terugbelverzoek=#31959b");
    name = "opmaak";
    displayName = "Speciale kolommen";
    slices: Slice[] = [this.mmss, this.databalk, this.databalkKleur, this.statusKleuren];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    tekst = new TekstCard();
    kop = new KopCard();
    totaal = new TotaalCard();
    opmaak = new OpmaakCard();
    lettertype = new LettertypeCard();
    cards = [this.tekst, this.kop, this.totaal, this.opmaak, this.lettertype];
}
