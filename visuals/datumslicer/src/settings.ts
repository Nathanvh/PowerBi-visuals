"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { instellingenHelpers } from "../../../shared/huisstijl";

const h = instellingenHelpers(formattingSettings);

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

class AlgemeenCard extends Card {
    modus = h.keuze("modus", "Modus", [{"value":"combi","displayName":"Van - tot met vorige/volgende (aanbevolen)"},{"value":"bereik","displayName":"Bereik (van - tot)"},{"value":"dag","displayName":"Eén dag"}], "combi");
    snelkeuze = h.schakel("snelkeuze", "Snelkeuzes tonen", true);
    name = "algemeen";
    displayName = "Algemeen";
    slices: Slice[] = [this.modus, this.snelkeuze];
}

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

class InvoerCard extends Card {
    grootte = h.num("grootte", "Tekstgrootte (pt)", 10.5);
    kleur = h.kleur("kleur", "Tekstkleur", "#262626");
    achtergrond = h.kleur("achtergrond", "Achtergrond", "#FFFFFF");
    rand = h.kleur("rand", "Randkleur", "#E5E5E5");
    radius = h.num("radius", "Hoekradius (px)", 6);
    hoogte = h.num("hoogte", "Hoogte (px)", 36);
    ruimte = h.num("ruimte", "Ruimte ertussen (px)", 8);
    accent = h.kleur("accent", "Accentkleur (actief)", "#111987");
    name = "invoer";
    displayName = "Invoer en knoppen";
    slices: Slice[] = [this.grootte, this.kleur, this.achtergrond, this.rand, this.radius, this.hoogte, this.ruimte, this.accent];
}

class LettertypeCard extends Card {
    familie = h.tekst("familie", "Lettertype", "Montserrat");
    name = "lettertype";
    displayName = "Lettertype";
    slices: Slice[] = [this.familie];
}

export class VisualFormattingSettingsModel extends Model {
    algemeen = new AlgemeenCard();
    label = new LabelCard();
    invoer = new InvoerCard();
    lettertype = new LettertypeCard();
    cards = [this.algemeen, this.label, this.invoer, this.lettertype];
}
