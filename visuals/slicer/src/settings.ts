"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class LabelCard extends Card {
    toon = h.schakel("toon", "Tonen", true);
    tekst = h.tekst("tekst", "Tekst (leeg = veldnaam)", "");
    grootte = h.num("grootte", "Tekstgrootte (pt)", 9);
    kleur = h.kleur("kleur", "Kleur", "#525252");
    vet = h.schakel("vet", "Vet", true);
    ruimteOnder = h.num("ruimteOnder", "Ruimte eronder (px)", 4);
    name = "label";
    displayName = "Label";
    slices: Slice[] = [this.toon, this.tekst, this.grootte, this.kleur, this.vet, this.ruimteOnder];
}

class TegelsCard extends Card {
    grootte = h.num("grootte", "Tekstgrootte (pt)", 10.5);
    kleur = h.kleur("kleur", "Tekstkleur", "#262626");
    achtergrond = h.kleur("achtergrond", "Achtergrond", "#FFFFFF");
    rand = h.kleur("rand", "Randkleur", "#E5E5E5");
    radius = h.num("radius", "Hoekradius (px)", 6);
    hoogte = h.num("hoogte", "Hoogte (px)", 36);
    paddingZij = h.num("paddingZij", "Padding links/rechts (px)", 8);
    ruimte = h.num("ruimte", "Ruimte tussen tegels (px)", 6);
    meerdere = h.schakel("meerdere", "Meerdere selecteren", true);
    toonAlles = h.schakel("toonAlles", "Alles-tegel tonen", true);
    allesTekst = h.tekst("allesTekst", "Tekst Alles-tegel", "Alles");
    name = "tegels";
    displayName = "Tegels";
    slices: Slice[] = [this.grootte, this.kleur, this.achtergrond, this.rand, this.radius, this.hoogte, this.paddingZij, this.ruimte, this.meerdere, this.toonAlles, this.allesTekst];
}

class GekozenCard extends Card {
    achtergrond = h.kleur("achtergrond", "Achtergrond", "#111987");
    kleur = h.kleur("kleur", "Tekstkleur", "#FFFFFF");
    name = "gekozen";
    displayName = "Geselecteerde tegel";
    slices: Slice[] = [this.achtergrond, this.kleur];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    label = new LabelCard();
    tegels = new TegelsCard();
    gekozen = new GekozenCard();
    lettertype = new LettertypeCard();
    cards = [this.label, this.tegels, this.gekozen, this.lettertype];
}
