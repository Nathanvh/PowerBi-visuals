"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class TitelCard extends Card {
    tekst = h.tekst("tekst", "Tekst (als er geen measure is)", "");
    grootte = h.num("grootte", "Tekstgrootte (pt)", 24);
    kleur = h.kleur("kleur", "Kleur", "#111987");
    regelhoogte = h.num("regelhoogte", "Regelhoogte (x)", 1.2);
    name = "titel";
    displayName = "Titel";
    slices: Slice[] = [this.tekst, this.grootte, this.kleur, this.regelhoogte];
}

class OndertitelCard extends Card {
    toon = h.schakel("toon", "Tonen", true);
    tekst = h.tekst("tekst", "Tekst (als er geen measure is)", "");
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9.75);
    kleur = h.kleur("kleur", "Kleur", "#525252");
    regelhoogte = h.num("regelhoogte", "Regelhoogte (x)", 1.3);
    ruimteBoven = h.num("ruimteBoven", "Ruimte erboven (px)", 4);
    name = "ondertitel";
    displayName = "Ondertitel";
    slices: Slice[] = [this.toon, this.tekst, this.grootte, this.kleur, this.regelhoogte, this.ruimteBoven];
}

class LijnCard extends Card {
    toon = h.schakel("toon", "Tonen", true);
    kleur = h.kleur("kleur", "Kleur", "#dd7d32");
    dikte = h.num("dikte", "Dikte (px)", 3);
    ruimteBoven = h.num("ruimteBoven", "Ruimte erboven (px)", 12);
    name = "lijn";
    displayName = "Lijn";
    slices: Slice[] = [this.toon, this.kleur, this.dikte, this.ruimteBoven];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    titel = new TitelCard();
    ondertitel = new OndertitelCard();
    lijn = new LijnCard();
    lettertype = new LettertypeCard();
    cards = [this.titel, this.ondertitel, this.lijn, this.lettertype];
}
