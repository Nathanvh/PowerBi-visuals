"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, formatteer, mmss, escapeHtml } from "../../../shared/huisstijl";

const pad = (n: number) => String(n).padStart(2, "0");

/** Mooie bovengrens en stap voor een as. */
function mooieSchaal(max: number, ticks = 4): { max: number, stap: number } {
    if (!(max > 0)) { return { max: 1, stap: 1 }; }
    const ruw = max / ticks;
    const mag = Math.pow(10, Math.floor(Math.log10(ruw)));
    const f = ruw / mag;
    const stap = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    return { max: Math.ceil(max / stap) * stap, stap };
}

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private root: HTMLElement;
    private legendaEl: HTMLElement;
    private vlak: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.root = document.createElement("div");
        this.root.className = "grafiek";
        this.legendaEl = document.createElement("div"); this.legendaEl.className = "legenda";
        this.vlak = document.createElement("div"); this.vlak.className = "vlak";
        this.root.append(this.legendaEl, this.vlak);
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            this.teken(dv);
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    private teken(dv: any) {
        const s = this.fs;
        const cat = dv && dv.categorical && dv.categorical.categories && dv.categorical.categories[0];
        const kolommen: any[] = ((dv && dv.categorical && dv.categorical.values) || []).filter((v: any) => v.source.roles && v.source.roles.waarden);
        const lijnKol: any = ((dv && dv.categorical && dv.categorical.values) || []).find((v: any) => v.source.roles && v.source.roles.lijn);
        this.root.style.fontFamily = fontStack(s.lettertype.familie.value);
        this.legendaEl.textContent = "";
        this.vlak.textContent = "";
        if (!cat || (!kolommen.length && !lijnKol)) { return; }

        const fpx = s.assen.grootte.value * 4 / 3;
        const tekstKleur = s.assen.kleur.value.value;
        const kleuren = [s.reeks.k1, s.reeks.k2, s.reeks.k3, s.reeks.k4, s.reeks.k5, s.reeks.k6].map(k => k.value.value);
        const n = cat.values.length;
        const labelVan = (v: any): string => v instanceof Date ? `${pad(v.getDate())}-${pad(v.getMonth() + 1)}` : formatteer(v, cat.source.format);
        const labels = cat.values.map(labelVan);

        // Legenda
        if (s.algemeen.legenda.value && (kolommen.length + (lijnKol ? 1 : 0)) > 1) {
            this.legendaEl.style.fontSize = `${s.assen.grootte.value}pt`;
            this.legendaEl.style.color = tekstKleur;
            kolommen.forEach((k, i) => {
                this.legendaEl.insertAdjacentHTML("beforeend", `<span class="item"><span class="blok" style="background:${kleuren[i % 6]}"></span>${escapeHtml(k.source.displayName)}</span>`);
            });
            if (lijnKol) {
                this.legendaEl.insertAdjacentHTML("beforeend", `<span class="item"><span class="lijnteken" style="background:${s.lijn.kleur.value.value}"></span>${escapeHtml(lijnKol.source.displayName)}</span>`);
            }
            this.legendaEl.style.display = "flex";
        } else {
            this.legendaEl.style.display = "none";
        }

        const W = Math.max(this.vlak.clientWidth, 50), H = Math.max(this.vlak.clientHeight, 50);
        const gestapeld = String(s.algemeen.modus.value.value) === "gestapeld";
        const beide = kolommen.length > 0 && !!lijnKol;

        // Schalen
        const kolomWaarde = (ki: number, i: number): number => { const v = kolommen[ki].values[i]; return typeof v === "number" ? v : 0; };
        let maxKolom = 0;
        for (let i = 0; i < n; i++) {
            if (gestapeld) { maxKolom = Math.max(maxKolom, kolommen.reduce((a, _, ki) => a + kolomWaarde(ki, i), 0)); }
            else { kolommen.forEach((_, ki) => { maxKolom = Math.max(maxKolom, kolomWaarde(ki, i)); }); }
        }
        const lijnWaarden: (number | null)[] = lijnKol ? lijnKol.values.map((v: any) => typeof v === "number" ? v : null) : [];
        const maxLijn = lijnWaarden.reduce((a: number, v) => v === null ? a : Math.max(a, v), 0);
        const linkerSchaal = mooieSchaal(kolommen.length ? maxKolom : maxLijn);
        const rechterSchaal = beide ? mooieSchaal(maxLijn) : null;

        const fmtKolom = (v: number) => s.kolommen.mmss.value ? mmss(v) : formatteer(v, kolommen[0] && kolommen[0].source.format);
        const fmtLijn = (v: number) => s.lijn.mmss.value ? mmss(v) : formatteer(v, lijnKol && lijnKol.source.format);
        const fmtLinks = (v: number) => kolommen.length ? fmtKolom(v) : fmtLijn(v);

        const tekstBreedte = (t: string) => t.length * fpx * 0.62;
        const tickN = Math.round(linkerSchaal.max / linkerSchaal.stap);
        const linkerLabels = Array.from({ length: tickN + 1 }, (_, i) => fmtLinks(i * linkerSchaal.stap));
        const rechterLabels = rechterSchaal ? Array.from({ length: Math.round(rechterSchaal.max / rechterSchaal.stap) + 1 }, (_, i) => fmtLijn(i * rechterSchaal.stap)) : [];
        const toonY = s.assen.toonY.value;
        const links = toonY ? Math.max(...linkerLabels.map(tekstBreedte)) + 10 : 4;
        const rechts = rechterSchaal && toonY ? Math.max(...rechterLabels.map(tekstBreedte)) + 10 : 6;
        const boven = fpx + 6, onder = fpx + 10;
        const pw = W - links - rechts, ph = H - boven - onder;
        if (pw <= 10 || ph <= 10) { return; }
        const yL = (v: number) => boven + ph - (v / linkerSchaal.max) * ph;
        const yR = (v: number) => boven + ph - (v / (rechterSchaal ? rechterSchaal.max : 1)) * ph;
        const band = pw / Math.max(n, 1);
        const cx = (i: number) => links + band * i + band / 2;

        const delen: string[] = [];
        // Raster en waardeas
        for (let i = 0; i <= tickN; i++) {
            const v = i * linkerSchaal.stap, y = yL(v);
            if (s.assen.raster.value) { delen.push(`<line x1="${links}" x2="${W - rechts}" y1="${y}" y2="${y}" stroke="${s.assen.rasterKleur.value.value}" stroke-width="1"/>`); }
            if (toonY) { delen.push(`<text x="${links - 6}" y="${y + fpx * 0.35}" text-anchor="end" font-size="${fpx}" fill="${tekstKleur}">${escapeHtml(linkerLabels[i])}</text>`); }
        }
        if (rechterSchaal && toonY) {
            rechterLabels.forEach((t, i) => {
                delen.push(`<text x="${W - rechts + 6}" y="${yR(i * rechterSchaal.stap) + fpx * 0.35}" text-anchor="start" font-size="${fpx}" fill="${tekstKleur}">${escapeHtml(t)}</text>`);
            });
        }
        // Kolommen
        const ratio = Math.max(0.1, Math.min(1, s.kolommen.breedte.value));
        const r = s.kolommen.radius.value;
        for (let i = 0; i < n; i++) {
            if (gestapeld) {
                const bw = band * ratio; let acc = 0;
                kolommen.forEach((k, ki) => {
                    const v = kolomWaarde(ki, i); if (v <= 0) { return; }
                    const y1 = yL(acc + v), y0 = yL(acc);
                    delen.push(`<rect x="${cx(i) - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(y0 - y1, 0)}" fill="${kleuren[ki % 6]}"><title>${escapeHtml(labels[i])} - ${escapeHtml(k.source.displayName)}: ${escapeHtml(fmtKolom(v))}</title></rect>`);
                    acc += v;
                });
                if (s.kolommen.labels.value && acc > 0) {
                    delen.push(`<text x="${cx(i)}" y="${yL(acc) - 4}" text-anchor="middle" font-size="${fpx}" fill="${tekstKleur}">${escapeHtml(fmtKolom(acc))}</text>`);
                }
            } else {
                const bw = band * ratio / Math.max(kolommen.length, 1);
                kolommen.forEach((k, ki) => {
                    const v = kolomWaarde(ki, i);
                    const x = cx(i) - (band * ratio) / 2 + bw * ki;
                    const y = yL(v);
                    delen.push(`<rect x="${x}" y="${y}" width="${Math.max(bw - 1, 1)}" height="${Math.max(yL(0) - y, 0)}" rx="${r}" fill="${kleuren[ki % 6]}"><title>${escapeHtml(labels[i])} - ${escapeHtml(k.source.displayName)}: ${escapeHtml(fmtKolom(v))}</title></rect>`);
                    if (s.kolommen.labels.value && v > 0) {
                        delen.push(`<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" font-size="${fpx}" fill="${tekstKleur}">${escapeHtml(fmtKolom(v))}</text>`);
                    }
                });
            }
        }
        // Lijn
        if (lijnKol) {
            const yFn = beide ? yR : yL;
            let pad_ = "";
            let pen = false;
            lijnWaarden.forEach((v, i) => {
                if (v === null) { pen = false; return; }
                pad_ += `${pen ? "L" : "M"}${cx(i).toFixed(1)},${yFn(v).toFixed(1)}`;
                pen = true;
            });
            delen.push(`<path d="${pad_}" fill="none" stroke="${s.lijn.kleur.value.value}" stroke-width="${s.lijn.dikte.value}" stroke-linejoin="round" stroke-linecap="round"/>`);
            lijnWaarden.forEach((v, i) => {
                if (v === null) { return; }
                if (s.lijn.punten.value) {
                    delen.push(`<circle cx="${cx(i)}" cy="${yFn(v)}" r="${s.lijn.dikte.value + 1.5}" fill="#FFFFFF" stroke="${s.lijn.kleur.value.value}" stroke-width="${s.lijn.dikte.value}"><title>${escapeHtml(labels[i])} - ${escapeHtml(lijnKol.source.displayName)}: ${escapeHtml(fmtLijn(v))}</title></circle>`);
                }
                if (s.lijn.labels.value) {
                    delen.push(`<text x="${cx(i)}" y="${yFn(v) - 8}" text-anchor="middle" font-size="${fpx}" fill="${tekstKleur}">${escapeHtml(fmtLijn(v))}</text>`);
                }
            });
        }
        // Categorielabels (om en om weglaten als ze niet passen)
        const breedste = Math.max(...labels.map(tekstBreedte), 1);
        const stapL = Math.max(1, Math.ceil((breedste + 6) / band));
        labels.forEach((t, i) => {
            if (i % stapL !== 0) { return; }
            delen.push(`<text x="${cx(i)}" y="${H - 6}" text-anchor="middle" font-size="${fpx}" fill="${tekstKleur}">${escapeHtml(t)}</text>`);
        });
        delen.push(`<line x1="${links}" x2="${W - rechts}" y1="${yL(0)}" y2="${yL(0)}" stroke="${s.assen.rasterKleur.value.value}" stroke-width="1"/>`);

        this.vlak.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">${delen.join("")}</svg>`;
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.service.buildFormattingModel(this.fs);
    }
}
