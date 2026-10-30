"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class KaartCard extends Card {
    achtergrond = h.kleur("achtergrond", "Achtergrond", "#FFFFFF");
    randKleur = h.kleur("randKleur", "Randkleur", "#E5E5E5");
    randRadius = h.num("randRadius", "Hoekradius (px)", 8);
    paddingBoven = h.num("paddingBoven", "Padding boven/onder (px)", 8);
    paddingZij = h.num("paddingZij", "Padding links/rechts (px)", 16);
    indeling = h.keuze("indeling", "Indeling", [{"value": "standaard", "displayName": "Standaard (onder elkaar)"}, {"value": "compact", "displayName": "Compact (waarde rechts)"}], "compact");
    uitlijning = h.keuze("uitlijning", "Uitlijning", [{"value": "left", "displayName": "Links"}, {"value": "center", "displayName": "Midden"}, {"value": "right", "displayName": "Rechts"}], "left");
    name = "kaart";
    displayName = "Kaart";
    slices: Slice[] = [this.achtergrond, this.randKleur, this.randRadius, this.paddingBoven, this.paddingZij, this.indeling, this.uitlijning];
}

class AccentCard extends Card {
    toon = h.schakel("toon", "Tonen", false);
    standaardKleur = h.kleur("standaardKleur", "Standaardkleur", "#D4D4D4");
    hoogte = h.num("hoogte", "Hoogte (px)", 4);
    name = "accent";
    displayName = "Accentbalk";
    slices: Slice[] = [this.toon, this.standaardKleur, this.hoogte];
}

class LabelCard extends Card {
    tekst = h.tekst("tekst", "Tekst (leeg = veldnaam)", "");
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9.75);
    kleur = h.kleur("kleur", "Kleur", "#525252");
    vet = h.schakel("vet", "Vet", false);
    regelhoogte = h.num("regelhoogte", "Regelhoogte (x)", 1.2);
    ruimteOnder = h.num("ruimteOnder", "Ruimte eronder (px)", 0);
    regels = h.num("regels", "Aantal regels (ruimte blijft gereserveerd)", 1);
    name = "label";
    displayName = "Label";
    slices: Slice[] = [this.tekst, this.grootte, this.kleur, this.vet, this.regelhoogte, this.ruimteOnder, this.regels];
}

class WaardeCard extends Card {
    notatie = h.tekst("notatie", "Notatie (leeg = formaat van het veld)", "");
    grootte = h.num("grootte", "Tekstgrootte (pt)", 16);
    kleur = h.kleur("kleur", "Kleur", "#111987");
    regelhoogte = h.num("regelhoogte", "Regelhoogte (x)", 1.1);
    ruimteOnder = h.num("ruimteOnder", "Ruimte eronder (px)", 2);
    name = "waarde";
    displayName = "Waarde";
    slices: Slice[] = [this.notatie, this.grootte, this.kleur, this.regelhoogte, this.ruimteOnder];
}

class ToelichtingCard extends Card {
    toon = h.schakel("toon", "Tonen", true);
    tekst = h.tekst("tekst", "Vaste tekst (als er geen measure is)", "");
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9);
    kleur = h.kleur("kleur", "Kleur", "#525252");
    regelhoogte = h.num("regelhoogte", "Regelhoogte (x)", 1.2);
    regels = h.num("regels", "Aantal regels (ruimte blijft gereserveerd)", 1);
    name = "toelichting";
    displayName = "Toelichting";
    slices: Slice[] = [this.toon, this.tekst, this.grootte, this.kleur, this.regelhoogte, this.regels];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    kaart = new KaartCard();
    accent = new AccentCard();
    label = new LabelCard();
    waarde = new WaardeCard();
    toelichting = new ToelichtingCard();
    lettertype = new LettertypeCard();
    cards = [this.kaart, this.accent, this.label, this.waarde, this.toelichting, this.lettertype];
}
