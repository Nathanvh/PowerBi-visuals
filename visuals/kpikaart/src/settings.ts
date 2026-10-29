"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import Card = formattingSettings.SimpleCard;
import Slice = formattingSettings.Slice;
import Model = formattingSettings.Model;

const num = (name: string, displayName: string, value: number) =>
    new formattingSettings.NumUpDown({ name, displayName, value });
const col = (name: string, displayName: string, value: string) =>
    new formattingSettings.ColorPicker({ name, displayName, value: { value } });

class KaartCard extends Card {
    achtergrond = col("achtergrond", "Achtergrond", "#FFFFFF");
    randKleur = col("randKleur", "Randkleur", "#E5E5E5");
    randRadius = num("randRadius", "Hoekradius (px)", 8);
    paddingBoven = num("paddingBoven", "Padding boven/onder (px)", 12);
    paddingZij = num("paddingZij", "Padding links/rechts (px)", 12);
    afbreken = new formattingSettings.ToggleSwitch({ name: "afbreken", displayName: "Tekst afbreken", value: true });
    indeling = new formattingSettings.ItemDropdown({
        name: "indeling", displayName: "Indeling",
        items: [
            { value: "standaard", displayName: "Standaard (onder elkaar)" },
            { value: "compact", displayName: "Compact (waarde rechts)" }
        ],
        value: { value: "standaard", displayName: "Standaard (onder elkaar)" }
    });
    uitlijning = new formattingSettings.ItemDropdown({
        name: "uitlijning", displayName: "Uitlijning",
        items: [
            { value: "left", displayName: "Links" },
            { value: "center", displayName: "Midden" },
            { value: "right", displayName: "Rechts" }
        ],
        value: { value: "left", displayName: "Links" }
    });
    name = "kaart";
    displayName = "Kaart";
    slices: Slice[] = [this.achtergrond, this.randKleur, this.randRadius, this.paddingBoven, this.paddingZij, this.afbreken, this.indeling, this.uitlijning];
}

class AccentCard extends Card {
    toon = new formattingSettings.ToggleSwitch({ name: "toon", displayName: "Tonen", value: true });
    standaardKleur = col("standaardKleur", "Standaardkleur", "#D4D4D4");
    hoogte = num("hoogte", "Hoogte (px)", 4);
    name = "accent";
    displayName = "Accentbalk";
    slices: Slice[] = [this.toon, this.standaardKleur, this.hoogte];
}

class LabelCard extends Card {
    tekst = new formattingSettings.TextInput({ name: "tekst", displayName: "Tekst", value: "", placeholder: "Naam van de kaart" });
    grootte = num("grootte", "Tekstgrootte (pt)", 9);
    kleur = col("kleur", "Kleur", "#525252");
    vet = new formattingSettings.ToggleSwitch({ name: "vet", displayName: "Vet", value: false });
    regelhoogte = num("regelhoogte", "Regelhoogte (x)", 1.2);
    ruimteOnder = num("ruimteOnder", "Ruimte eronder (px)", 4);
    name = "label";
    displayName = "Label";
    slices: Slice[] = [this.tekst, this.grootte, this.kleur, this.vet, this.regelhoogte, this.ruimteOnder];
}

class WaardeCard extends Card {
    grootte = num("grootte", "Tekstgrootte (pt)", 24);
    kleur = col("kleur", "Kleur", "#111987");
    regelhoogte = num("regelhoogte", "Regelhoogte (x)", 1.1);
    ruimteOnder = num("ruimteOnder", "Ruimte eronder (px)", 2);
    name = "waarde";
    displayName = "Waarde";
    slices: Slice[] = [this.grootte, this.kleur, this.regelhoogte, this.ruimteOnder];
}

class ToelichtingCard extends Card {
    toon = new formattingSettings.ToggleSwitch({ name: "toon", displayName: "Tonen", value: true });
    grootte = num("grootte", "Tekstgrootte (pt)", 9);
    kleur = col("kleur", "Kleur", "#525252");
    regelhoogte = num("regelhoogte", "Regelhoogte (x)", 1.2);
    name = "toelichting";
    displayName = "Toelichting";
    slices: Slice[] = [this.toon, this.grootte, this.kleur, this.regelhoogte];
}

class LettertypeCard extends Card {
    familie = new formattingSettings.TextInput({ name: "familie", displayName: "Lettertype", value: "Montserrat", placeholder: "Montserrat" });
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
