"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, formatteer, kolomVoorRol } from "../../../shared/huisstijl";

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private root: HTMLElement;
    private pTitel: HTMLElement;
    private pSub: HTMLElement;
    private lijn: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.root = document.createElement("div");
        this.root.className = "paginatitel";
        this.pTitel = document.createElement("p"); this.pTitel.className = "regel titel";
        this.pSub = document.createElement("p"); this.pSub.className = "regel sub";
        this.lijn = document.createElement("div"); this.lijn.className = "lijn";
        this.root.append(this.pTitel, this.pSub, this.lijn);
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            const s = this.fs;
            const tekstVan = (rol: string, terugval: string) => {
                const k = kolomVoorRol(dv, rol);
                return k && k.values[0] !== null && k.values[0] !== undefined ? formatteer(k.values[0], k.source.format) : terugval;
            };
            this.root.style.fontFamily = fontStack(s.lettertype.familie.value);
            this.pTitel.textContent = tekstVan("titel", s.titel.tekst.value);
            this.pTitel.style.fontSize = `${s.titel.grootte.value}pt`;
            this.pTitel.style.color = s.titel.kleur.value.value;
            this.pTitel.style.lineHeight = String(s.titel.regelhoogte.value);
            const toonSub = s.ondertitel.toon.value;
            this.pSub.style.display = toonSub ? "block" : "none";
            this.pSub.textContent = tekstVan("ondertitel", s.ondertitel.tekst.value);
            this.pSub.style.fontSize = `${s.ondertitel.grootte.value}pt`;
            this.pSub.style.color = s.ondertitel.kleur.value.value;
            this.pSub.style.lineHeight = String(s.ondertitel.regelhoogte.value);
            this.pSub.style.marginTop = `${s.ondertitel.ruimteBoven.value}px`;
            this.lijn.style.display = s.lijn.toon.value ? "block" : "none";
            this.lijn.style.height = `${s.lijn.dikte.value}px`;
            this.lijn.style.background = s.lijn.kleur.value.value;
            this.lijn.style.marginTop = `${s.lijn.ruimteBoven.value}px`;
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.service.buildFormattingModel(this.fs);
    }
}
