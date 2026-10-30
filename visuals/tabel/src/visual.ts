"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, formatteer, formatCode, leesNotaties, mmss, isHex, escapeHtml } from "../../../shared/huisstijl";

const lijstVan = (t: string) => (t || "").split(",").map(x => x.trim().toLowerCase()).filter(x => x);

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private root: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();
    private dv: any;
    private sorteerKolom = -1;
    private richting = 1;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.root = document.createElement("div");
        this.root.className = "tabel";
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            this.dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, this.dv);
            this.teken();
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    private teken() {
        const s = this.fs;
        const t: any = this.dv && this.dv.table;
        this.root.textContent = "";
        this.root.style.fontFamily = fontStack(s.lettertype.familie.value);
        if (!t || !t.columns) { return; }
        const kol: any[] = t.columns;
        const isGetal = (c: any) => !!(c.type && (c.type.numeric || c.type.integer));
        const mmssKol = new Set(lijstVan(s.opmaak.mmss.value));
        const notaties = leesNotaties(s.opmaak.notaties.value);
        // een kolom matcht op de naam in de kop en op de oorspronkelijke veldnaam
        const namenVan = (c: any): string[] => [String(c.displayName).toLowerCase(), String(c.queryName || "").split(".").pop()!.toLowerCase()];
        const inLijst = (c: any, set: Set<string>) => namenVan(c).some(n => set.has(n));
        const zonderTotaal = new Set(lijstVan(s.totaal.uitsluiten.value));
        // "Kolom=#kleur; Kolom2=#kleur2" of "Kolom, Kolom2" (zonder kleur geldt de standaardkleur)
        const balkDef: { naam: string, kleur: string }[] = (s.opmaak.databalk.value || "").split(/[;,\n]/).map((x: string) => {
            const [n, k] = x.split("=");
            return { naam: (n || "").trim().toLowerCase(), kleur: k && isHex(k.trim()) ? k.trim() : s.opmaak.databalkKleur.value.value };
        }).filter((d: any) => d.naam);
        const status: { [k: string]: string } = {};
        (s.opmaak.statusKleuren.value || "").split(";").forEach((p: string) => {
            const [k, v] = p.split("=");
            if (k && v && isHex(v)) { status[k.trim().toLowerCase()] = v.trim(); }
        });

        let rijen: any[][] = (t.rows || []).slice();
        if (this.sorteerKolom >= 0) {
            const i = this.sorteerKolom, r = this.richting;
            rijen.sort((a, b) => {
                const x = a[i], y = b[i];
                if (x === y) { return 0; }
                if (x === null || x === undefined) { return 1; }
                if (y === null || y === undefined) { return -1; }
                return (x > y ? 1 : -1) * r;
            });
        }

        const maakTekst = (c: any, v: any): string => {
            if (v === null || v === undefined) { return ""; }
            const code = namenVan(c).map(n => notaties[n]).find(x => x);
            if (code) { return formatCode(v, code, c.format); }
            if (inLijst(c, mmssKol) && typeof v === "number") { return mmss(v); }
            if (v instanceof Date) {
                const heeftTijd = v.getHours() + v.getMinutes() + v.getSeconds() > 0;
                return heeftTijd ? v.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" } as any) : v.toLocaleDateString("nl-NL");
            }
            return formatteer(v, c.format);
        };

        const tbl = document.createElement("table");
        const thead = tbl.createTHead().insertRow();
        const celPad = `${s.tekst.rijPadding.value}px ${s.tekst.kolomRuimte.value / 2}px`;
        kol.forEach((c, i) => {
            const th = document.createElement("th");
            th.textContent = c.displayName;
            th.className = (isGetal(c) ? "num" : "") + (s.tekst.sorteren.value ? " sorteerbaar" : "");
            th.style.fontSize = `${s.kop.grootte.value}pt`;
            th.style.color = s.kop.kleur.value.value;
            th.style.fontWeight = s.kop.vet.value ? "700" : "400";
            th.style.padding = `${Math.max(s.tekst.rijPadding.value - 4, 2)}px ${s.tekst.kolomRuimte.value / 2}px`;
            th.style.borderBottom = `${s.kop.lijnDikte.value}px solid ${s.kop.lijnKleur.value.value}`;
            if (this.sorteerKolom === i) { th.textContent += this.richting === 1 ? " \u25B2" : " \u25BC"; }
            if (s.tekst.sorteren.value) {
                th.addEventListener("click", () => {
                    if (this.sorteerKolom === i) { this.richting = -this.richting; } else { this.sorteerKolom = i; this.richting = 1; }
                    this.teken();
                });
            }
            thead.appendChild(th);
        });

        const balken: { [i: number]: { max: number, kleur: string } } = {};
        balkDef.forEach(d => {
            const bi = kol.findIndex(c => namenVan(c).indexOf(d.naam) >= 0);
            if (bi >= 0) { balken[bi] = { kleur: d.kleur, max: rijen.reduce((m, r) => typeof r[bi] === "number" ? Math.max(m, r[bi]) : m, 0) }; }
        });

        const tbody = tbl.createTBody();
        rijen.forEach((r, ri) => {
            const tr = tbody.insertRow();
            if (s.tekst.zebra.value && ri % 2 === 1) { tr.style.background = s.tekst.zebraKleur.value.value; }
            kol.forEach((c, i) => {
                const td = tr.insertCell();
                const v = r[i];
                const tekst = maakTekst(c, v);
                td.className = isGetal(c) ? "num" : "";
                td.style.fontSize = `${s.tekst.grootte.value}pt`;
                td.style.color = s.tekst.kleur.value.value;
                td.style.padding = celPad;
                td.style.borderBottom = `1px solid ${s.tekst.scheiding.value.value}`;
                const kleur = status[String(v).toLowerCase()];
                const balk = balken[i];
                if (balk && balk.max > 0 && typeof v === "number") {
                    td.classList.add("bar");
                    td.innerHTML = `<div class="vulling" style="width:${Math.max(0, v / balk.max) * 100}%;background:${balk.kleur}"></div><span class="tekst">${escapeHtml(tekst)}</span>`;
                } else if (kleur) {
                    td.innerHTML = `<span class="stip" style="background:${kleur}"></span>${escapeHtml(tekst)}`;
                } else {
                    td.textContent = tekst;
                }
            });
        });

        if (s.totaal.toon.value && rijen.length) {
            const tf = tbl.createTFoot().insertRow();
            kol.forEach((c, i) => {
                const td = tf.insertCell();
                td.className = isGetal(c) ? "num" : "";
                td.style.fontSize = `${s.tekst.grootte.value}pt`;
                td.style.color = s.kop.kleur.value.value;
                td.style.padding = celPad;
                td.style.borderTop = `${s.kop.lijnDikte.value}px solid ${s.kop.lijnKleur.value.value}`;
                if (i === 0) { td.textContent = s.totaal.label.value || "Totaal"; return; }
                if (isGetal(c) && !inLijst(c, zonderTotaal) && String(c.format || "").indexOf("%") < 0) {
                    const som = rijen.reduce((a, row) => typeof row[i] === "number" ? a + row[i] : a, 0);
                    td.textContent = maakTekst(c, som);
                }
            });
        }
        this.root.appendChild(tbl);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.service.buildFormattingModel(this.fs);
    }
}
