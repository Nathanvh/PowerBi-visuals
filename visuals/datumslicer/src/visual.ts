"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, datumFormat } from "../../../shared/huisstijl";

const pad = (n: number) => String(n).padStart(2, "0");
const lokaal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const naarYmd = (v: any): string => {
    if (v instanceof Date) { return lokaal(v); }
    const s = String(v);
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.substring(0, 10) : lokaal(new Date(s));
};
const plusDagen = (ymd: string, n: number): string => {
    const [y, m, d] = ymd.split("-").map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
};
const dagenTussen = (a: string, b: string): number => {
    const x = a.split("-").map(Number), y = b.split("-").map(Number);
    return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 86400000);
};
const iso = (ymd: string) => `${ymd}T00:00:00.000Z`;

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private host: powerbi.extensibility.visual.IVisualHost;
    private root: HTMLElement;
    private lbl: HTMLElement;
    private rij: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();
    private target: { table: string, column: string } | null = null;
    private min = ""; private max = "";
    private start = ""; private eind = "";
    private veldnaam = "";
    private toegepastOp = 0;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        this.root = document.createElement("div");
        this.root.className = "datumslicer";
        this.lbl = document.createElement("p"); this.lbl.className = "label";
        this.rij = document.createElement("div"); this.rij.className = "rij";
        this.root.append(this.lbl, this.rij);
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            const cat = dv && dv.categorical && dv.categorical.categories && dv.categorical.categories[0];
            this.target = null; this.min = ""; this.max = "";
            if (cat) {
                const q: string = cat.source.queryName || "";
                const naam: string = cat.source.displayName;
                const tabel = q.endsWith("." + naam) ? q.substring(0, q.length - naam.length - 1) : q.substring(0, q.indexOf("."));
                this.target = { table: tabel, column: naam };
                this.veldnaam = naam;
                const dagen = cat.values.filter((v: any) => v !== null && v !== undefined).map(naarYmd).sort();
                if (dagen.length) { this.min = dagen[0]; this.max = dagen[dagen.length - 1]; }
            }
            // Filter terugzetten: eerst jsonFilters, dan metadata. Net toegepast en nog niets terug? Dan lokale keuze houden.
            const jf: any = (options as any).jsonFilters;
            const meta: any = dv && dv.metadata && dv.metadata.objects && (dv.metadata.objects as any).general && (dv.metadata.objects as any).general.filter;
            const f: any = (Array.isArray(jf) && jf.length ? jf[0] : null) || meta;
            if (f && Array.isArray(f.conditions)) {
                let st = "", ei = "";
                f.conditions.forEach((c: any) => {
                    if (c.operator === "GreaterThanOrEqual" || c.operator === "GreaterThan") { st = naarYmd(c.value); }
                    if (c.operator === "LessThan") { ei = plusDagen(naarYmd(c.value), -1); }
                    if (c.operator === "LessThanOrEqual") { ei = naarYmd(c.value); }
                });
                this.start = st; this.eind = ei;
            } else if (Date.now() - this.toegepastOp > 3000) {
                this.start = ""; this.eind = "";
            }
            this.teken();
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    private teken() {
        const s = this.fs;
        const modus = String(s.algemeen.modus.value.value);
        const dag = modus === "dag";
        this.root.style.fontFamily = fontStack(s.lettertype.familie.value);
        this.lbl.style.display = s.label.toon.value ? "block" : "none";
        this.lbl.textContent = s.label.tekst.value || this.veldnaam;
        this.lbl.style.fontSize = `${s.label.grootte.value}pt`;
        this.lbl.style.color = s.label.kleur.value.value;
        this.lbl.style.fontWeight = s.label.vet.value ? "700" : "400";
        this.lbl.style.marginBottom = `${s.label.ruimteOnder.value}px`;
        this.rij.style.gap = `${s.invoer.ruimte.value}px`;
        this.rij.textContent = "";

        const stijl = (el: HTMLElement, actief = false) => {
            el.style.fontSize = `${s.invoer.grootte.value}pt`;
            el.style.minHeight = `${s.invoer.hoogte.value}px`;
            el.style.borderRadius = `${s.invoer.radius.value}px`;
            el.style.borderColor = actief ? s.invoer.accent.value.value : s.invoer.rand.value.value;
            el.style.background = actief ? s.invoer.accent.value.value : s.invoer.achtergrond.value.value;
            el.style.color = actief ? "#FFFFFF" : s.invoer.kleur.value.value;
        };
        const knop = (tekst: string, klik: () => void, actief = false, pijl = false) => {
            const b = document.createElement("button");
            b.type = "button"; b.className = "knop" + (pijl ? " pijl" : ""); b.textContent = tekst;
            if (pijl) { b.setAttribute("aria-label", tekst === "‹" ? "Vorige dag" : "Volgende dag"); }
            stijl(b, actief);
            b.addEventListener("click", klik);
            this.rij.appendChild(b);
        };
        const veld = (waarde: string, label: string, wijzig: (v: string) => void) => {
            // Native datuminvoer toont de taal van de browser (mm/dd/yyyy). Daarom een eigen tekst eroverheen.
            const w = document.createElement("label");
            w.className = "veld";
            stijl(w);
            const t = document.createElement("span");
            t.className = "tekst" + (waarde ? "" : " leeg");
            const [jj, mm, dd] = waarde ? waarde.split("-").map(Number) : [0, 0, 0];
            t.textContent = waarde ? datumFormat(new Date(jj, mm - 1, dd), s.invoer.datumnotatie.value || "dd-MM-yyyy") : label;
            const i = document.createElement("input");
            i.type = "date"; i.value = waarde; i.setAttribute("aria-label", label); i.lang = "nl-NL";
            if (this.min) { i.min = this.min; }
            if (this.max) { i.max = this.max; }
            i.addEventListener("click", () => { try { (i as any).showPicker(); } catch (e) { /* valt terug op standaardgedrag */ } });
            i.addEventListener("change", () => { if (i.value) { wijzig(i.value); } });
            w.append(t, i);
            this.rij.appendChild(w);
        };

        const vandaag = lokaal(new Date());
        if (dag) {
            const huidig = this.start || "";
            knop("‹", () => this.zet(plusDagen(huidig || vandaag, -1), plusDagen(huidig || vandaag, -1)), false, true);
            veld(huidig, "Datum", v => this.zet(v, v));
            knop("›", () => this.zet(plusDagen(huidig || vandaag, 1), plusDagen(huidig || vandaag, 1)), false, true);
            if (s.algemeen.snelkeuze.value) {
                knop("Vandaag", () => this.zet(vandaag, vandaag), huidig === vandaag);
                knop("Gisteren", () => this.zet(plusDagen(vandaag, -1), plusDagen(vandaag, -1)), huidig === plusDagen(vandaag, -1));
            }
        } else if (modus === "bereik") {
            veld(this.start, "Van", v => this.zet(v, this.eind && this.eind >= v ? this.eind : v));
            veld(this.eind, "Tot en met", v => this.zet(this.start && this.start <= v ? this.start : v, v));
            if (s.algemeen.snelkeuze.value) {
                knop("Vandaag", () => this.zet(vandaag, vandaag), this.start === vandaag && this.eind === vandaag);
                knop("7 dagen", () => this.zet(plusDagen(vandaag, -6), vandaag), this.start === plusDagen(vandaag, -6) && this.eind === vandaag);
                knop("30 dagen", () => this.zet(plusDagen(vandaag, -29), vandaag), this.start === plusDagen(vandaag, -29) && this.eind === vandaag);
                knop("Alles", () => this.zet("", ""), !this.start && !this.eind);
            }
        } else {
            // combi: vorige/volgende verschuift de hele periode met zijn eigen lengte
            const lengte = this.start && this.eind ? Math.max(1, dagenTussen(this.start, this.eind) + 1) : 1;
            const basis = this.start || vandaag;
            knop("‹", () => this.zet(plusDagen(basis, -lengte), plusDagen(this.eind || basis, -lengte)), false, true);
            veld(this.start, "Van", v => this.zet(v, this.eind && this.eind >= v ? this.eind : v));
            veld(this.eind, "Tot en met", v => this.zet(this.start && this.start <= v ? this.start : v, v));
            knop("›", () => this.zet(plusDagen(basis, lengte), plusDagen(this.eind || basis, lengte)), false, true);
            if (s.algemeen.snelkeuze.value) {
                knop("Vandaag", () => this.zet(vandaag, vandaag), this.start === vandaag && this.eind === vandaag);
                knop("Gisteren", () => this.zet(plusDagen(vandaag, -1), plusDagen(vandaag, -1)), this.start === plusDagen(vandaag, -1) && this.eind === plusDagen(vandaag, -1));
                knop("7 dagen", () => this.zet(plusDagen(vandaag, -6), vandaag), this.start === plusDagen(vandaag, -6) && this.eind === vandaag);
                knop("30 dagen", () => this.zet(plusDagen(vandaag, -29), vandaag), this.start === plusDagen(vandaag, -29) && this.eind === vandaag);
                knop("Alles", () => this.zet("", ""), !this.start && !this.eind);
            }
        }
    }

    private zet(start: string, eind: string) {
        if (!this.target) { return; }
        this.start = start; this.eind = eind; this.toegepastOp = Date.now();
        if (!start && !eind) {
            this.host.applyJsonFilter(null as any, "general", "filter", 1 as any);
        } else {
            const conditions: any[] = [];
            if (start) { conditions.push({ operator: "GreaterThanOrEqual", value: iso(start) }); }
            if (eind) { conditions.push({ operator: "LessThan", value: iso(plusDagen(eind, 1)) }); }
            const filter: any = {
                $schema: "https://powerbi.com/product/schema#advanced",
                target: this.target, filterType: 0, logicalOperator: "And", conditions
            };
            this.host.applyJsonFilter(filter, "general", "filter", 0 as any);
        }
        this.teken();
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.service.buildFormattingModel(this.fs);
    }
}
