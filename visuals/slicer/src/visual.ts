"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, formatteer } from "../../../shared/huisstijl";

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private host: powerbi.extensibility.visual.IVisualHost;
    private root: HTMLElement;
    private lbl: HTMLElement;
    private tegels: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();
    private target: { table: string, column: string } | null = null;
    private geselecteerd = new Set<string>();
    private waarden: { sleutel: string, tekst: string, ruw: any }[] = [];

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        this.root = document.createElement("div");
        this.root.className = "slicer";
        this.lbl = document.createElement("p"); this.lbl.className = "label";
        this.tegels = document.createElement("div"); this.tegels.className = "tegels";
        this.root.append(this.lbl, this.tegels);
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            const cat = dv && dv.categorical && dv.categorical.categories && dv.categorical.categories[0];
            this.waarden = [];
            this.target = null;
            if (cat) {
                const q: string = cat.source.queryName || "";
                const naam: string = cat.source.displayName;
                const tabel = q.endsWith("." + naam) ? q.substring(0, q.length - naam.length - 1) : q.substring(0, q.indexOf("."));
                this.target = { table: tabel, column: naam };
                cat.values.forEach((v: any) => this.waarden.push({ sleutel: String(v), tekst: formatteer(v, cat.source.format), ruw: v }));
            }
            // Huidige filter terugzetten
            this.geselecteerd = new Set<string>();
            const f: any = dv && dv.metadata && dv.metadata.objects && (dv.metadata.objects as any).general && (dv.metadata.objects as any).general.filter;
            if (f && Array.isArray(f.values)) { f.values.forEach((v: any) => this.geselecteerd.add(String(v))); }
            this.teken(cat ? cat.source.displayName : "");
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    private teken(veldnaam: string) {
        const s = this.fs;
        this.root.style.fontFamily = fontStack(s.lettertype.familie.value);
        const toonLabel = s.label.toon.value;
        this.lbl.style.display = toonLabel ? "block" : "none";
        this.lbl.textContent = s.label.tekst.value || veldnaam;
        this.lbl.style.fontSize = `${s.label.grootte.value}pt`;
        this.lbl.style.color = s.label.kleur.value.value;
        this.lbl.style.fontWeight = s.label.vet.value ? "700" : "400";
        this.lbl.style.marginBottom = `${s.label.ruimteOnder.value}px`;
        this.tegels.style.gap = `${s.tegels.ruimte.value}px`;
        this.tegels.textContent = "";
        const maak = (tekst: string, actief: boolean, klik: () => void) => {
            const b = document.createElement("button");
            b.type = "button"; b.className = "tegel"; b.textContent = tekst;
            b.setAttribute("aria-pressed", String(actief));
            b.style.fontSize = `${s.tegels.grootte.value}pt`;
            b.style.minHeight = `${s.tegels.hoogte.value}px`;
            b.style.padding = `0 ${s.tegels.paddingZij.value}px`;
            b.style.borderRadius = `${s.tegels.radius.value}px`;
            b.style.borderColor = actief ? s.gekozen.achtergrond.value.value : s.tegels.rand.value.value;
            b.style.background = actief ? s.gekozen.achtergrond.value.value : s.tegels.achtergrond.value.value;
            b.style.color = actief ? s.gekozen.kleur.value.value : s.tegels.kleur.value.value;
            b.style.fontWeight = actief ? "700" : "400";
            b.addEventListener("click", klik);
            this.tegels.appendChild(b);
        };
        if (s.tegels.toonAlles.value) {
            maak(s.tegels.allesTekst.value || "Alles", this.geselecteerd.size === 0, () => this.pas(null));
        }
        this.waarden.forEach(w => maak(w.tekst, this.geselecteerd.has(w.sleutel), () => this.pas(w)));
    }

    private pas(w: { sleutel: string, ruw: any } | null) {
        if (!this.target) { return; }
        if (w === null) {
            this.geselecteerd.clear();
        } else if (this.fs.tegels.meerdere.value) {
            if (this.geselecteerd.has(w.sleutel)) { this.geselecteerd.delete(w.sleutel); } else { this.geselecteerd.add(w.sleutel); }
        } else {
            const was = this.geselecteerd.has(w.sleutel) && this.geselecteerd.size === 1;
            this.geselecteerd.clear();
            if (!was) { this.geselecteerd.add(w.sleutel); }
        }
        const gekozen = this.waarden.filter(x => this.geselecteerd.has(x.sleutel)).map(x => x.ruw);
        if (gekozen.length === 0) {
            this.host.applyJsonFilter(null as any, "general", "filter", 1 as any); // verwijderen
        } else {
            const filter: any = {
                $schema: "https://powerbi.com/product/schema#basic",
                target: this.target, filterType: 1, operator: "In", values: gekozen
            };
            this.host.applyJsonFilter(filter, "general", "filter", 0 as any); // vervangen
        }
        this.teken(this.target.column);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.service.buildFormattingModel(this.fs);
    }
}
