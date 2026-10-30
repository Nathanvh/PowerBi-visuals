"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, formatCode, kolomVoorRol, isHex } from "../../../shared/huisstijl";

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private root: HTMLElement;
    private accent: HTMLElement;
    private pLabel: HTMLElement;
    private pWaarde: HTMLElement;
    private pToel: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.root = document.createElement("div");
        this.root.className = "kpikaart";
        this.accent = document.createElement("div"); this.accent.className = "accent";
        this.pLabel = document.createElement("p"); this.pLabel.className = "regel label";
        this.pWaarde = document.createElement("p"); this.pWaarde.className = "regel waarde";
        this.pToel = document.createElement("p"); this.pToel.className = "regel toel";
        this.root.append(this.accent, this.pLabel, this.pWaarde, this.pToel);
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            const s = this.fs;
            const cW = kolomVoorRol(dv, "waarde");
            const cT = kolomVoorRol(dv, "toelichting");
            const cK = kolomVoorRol(dv, "kleur");

            const waarde = cW ? formatCode(cW.values[0], s.waarde.notatie.value, cW.source.format) : "";
            const toelData = cT && cT.values[0] !== null && cT.values[0] !== undefined ? String(cT.values[0]) : "";
            const toel = toelData || s.toelichting.tekst.value || "";
            const kleurTekst = cK && cK.values[0] ? String(cK.values[0]).trim() : "";
            const label = s.label.tekst.value || (cW ? cW.source.displayName : "");

            const r = this.root.style;
            r.background = s.kaart.achtergrond.value.value;
            r.borderColor = s.kaart.randKleur.value.value;
            r.borderRadius = `${s.kaart.randRadius.value}px`;
            r.padding = `${s.kaart.paddingBoven.value}px ${s.kaart.paddingZij.value}px`;
            r.textAlign = String(s.kaart.uitlijning.value.value);
            r.fontFamily = fontStack(s.lettertype.familie.value);
            this.root.classList.toggle("compact", String(s.kaart.indeling.value.value) === "compact");

            this.accent.style.display = s.accent.toon.value ? "block" : "none";
            this.accent.style.height = `${s.accent.hoogte.value}px`;
            this.accent.style.background = isHex(kleurTekst) ? kleurTekst : s.accent.standaardKleur.value.value;

            const zet = (el: HTMLElement, tekst: string, pt: number, kleur: string, lh: number, onder: number, regels?: number, vet?: boolean) => {
                el.textContent = tekst;
                el.style.fontSize = `${pt}pt`;
                el.style.color = kleur;
                el.style.lineHeight = String(lh);
                el.style.marginBottom = `${onder}px`;
                if (vet !== undefined) { el.style.fontWeight = vet ? "700" : "400"; }
                if (regels) {
                    // vaste ruimte voor dit aantal regels, zodat de kaarten onderling gelijk blijven
                    const n = Math.max(1, Math.round(regels));
                    el.style.display = "-webkit-box";
                    (el.style as any).webkitBoxOrient = "vertical";
                    (el.style as any).webkitLineClamp = String(n);
                    el.style.whiteSpace = "normal";
                    el.style.overflowWrap = "anywhere";
                    el.style.minHeight = `${(n * lh * pt * 4) / 3}px`;
                }
            };
            zet(this.pLabel, label, s.label.grootte.value, s.label.kleur.value.value, s.label.regelhoogte.value, s.label.ruimteOnder.value, s.label.regels.value, s.label.vet.value);
            zet(this.pWaarde, waarde, s.waarde.grootte.value, s.waarde.kleur.value.value, s.waarde.regelhoogte.value, s.waarde.ruimteOnder.value);
            if (s.toelichting.toon.value) {
                zet(this.pToel, toel, s.toelichting.grootte.value, s.toelichting.kleur.value.value, s.toelichting.regelhoogte.value, 0, s.toelichting.regels.value);
            } else {
                this.pToel.style.display = "none";
            }
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.service.buildFormattingModel(this.fs);
    }
}
