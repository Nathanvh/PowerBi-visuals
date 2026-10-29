"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import DataViewValueColumn = powerbi.DataViewValueColumn;

import { VisualFormattingSettingsModel } from "./settings";

function formatteer(waarde: powerbi.PrimitiveValue, formaat?: string): string {
    if (waarde === null || waarde === undefined) { return ""; }
    if (typeof waarde !== "number") { return String(waarde); }
    const f = formaat || "";
    const dec = (f.split(".")[1] || "").replace(/[^0#]/g, "").length;
    if (f.indexOf("%") >= 0) {
        return (waarde * 100).toLocaleString("nl-NL", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + "%";
    }
    const isHeel = Number.isInteger(waarde);
    return waarde.toLocaleString("nl-NL", {
        minimumFractionDigits: f ? dec : 0,
        maximumFractionDigits: f ? dec : (isHeel ? 0 : 2)
    });
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private root: HTMLElement;
    private accent: HTMLElement;
    private pLabel: HTMLElement;
    private pWaarde: HTMLElement;
    private pToel: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.root = document.createElement("div");
        this.root.className = "kpikaart";
        this.accent = document.createElement("div");
        this.accent.className = "accent";
        this.pLabel = document.createElement("p");
        this.pLabel.className = "regel label";
        this.pWaarde = document.createElement("p");
        this.pWaarde.className = "regel waarde";
        this.pToel = document.createElement("p");
        this.pToel.className = "regel toel";
        this.root.append(this.accent, this.pLabel, this.pWaarde, this.pToel);
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            const s = this.formattingSettings;

            const kolom = (rol: string): DataViewValueColumn | undefined =>
                dv?.categorical?.values?.find(v => v.source.roles && v.source.roles[rol]);
            const cW = kolom("waarde");
            const cT = kolom("toelichting");
            const cK = kolom("kleur");

            const waarde = cW ? formatteer(cW.values[0], cW.source.format) : "";
            const toel = cT && cT.values[0] !== null && cT.values[0] !== undefined ? String(cT.values[0]) : "";
            const kleurTekst = cK && cK.values[0] ? String(cK.values[0]).trim() : "";
            const label = s.label.tekst.value || (cW ? cW.source.displayName : "");

            const r = this.root.style;
            r.background = s.kaart.achtergrond.value.value;
            r.borderColor = s.kaart.randKleur.value.value;
            r.borderRadius = `${s.kaart.randRadius.value}px`;
            r.padding = `${s.kaart.paddingBoven.value}px ${s.kaart.paddingZij.value}px`;
            r.textAlign = String(s.kaart.uitlijning.value.value);
            r.fontFamily = `${s.lettertype.familie.value || "Montserrat"}, "Segoe UI", Arial, sans-serif`;

            const compact = String(s.kaart.indeling.value.value) === "compact";
            this.root.classList.toggle("compact", compact);
            const wrap = s.kaart.afbreken.value;
            for (const el of [this.pLabel, this.pToel]) {
                el.style.whiteSpace = wrap ? "normal" : "nowrap";
                el.style.overflowWrap = wrap ? "anywhere" : "normal";
                el.style.textOverflow = wrap ? "clip" : "ellipsis";
            }

            const toonAccent = s.accent.toon.value;
            this.accent.style.display = toonAccent ? "block" : "none";
            this.accent.style.height = `${s.accent.hoogte.value}px`;
            this.accent.style.background = /^#[0-9a-fA-F]{3,8}$/.test(kleurTekst) ? kleurTekst : s.accent.standaardKleur.value.value;

            const zet = (el: HTMLElement, tekst: string, pt: number, kleur: string, lh: number, onder: number, vet?: boolean) => {
                el.textContent = tekst;
                el.style.fontSize = `${pt}pt`;
                el.style.color = kleur;
                el.style.lineHeight = String(lh);
                el.style.marginBottom = `${onder}px`;
                if (vet !== undefined) { el.style.fontWeight = vet ? "700" : "400"; }
            };
            zet(this.pLabel, label, s.label.grootte.value, s.label.kleur.value.value, s.label.regelhoogte.value, s.label.ruimteOnder.value, s.label.vet.value);
            zet(this.pWaarde, waarde, s.waarde.grootte.value, s.waarde.kleur.value.value, s.waarde.regelhoogte.value, s.waarde.ruimteOnder.value);

            const toonToel = s.toelichting.toon.value && toel !== "";
            this.pToel.style.display = toonToel ? "block" : "none";
            zet(this.pToel, toel, s.toelichting.grootte.value, s.toelichting.kleur.value.value, s.toelichting.regelhoogte.value, 0);

            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
