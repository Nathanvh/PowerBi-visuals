"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import { VisualFormattingSettingsModel } from "./settings";
import { fontStack, formatteer, formatCode, verloop, escapeHtml } from "../../../shared/huisstijl";

export class Visual implements IVisual {
    private events: powerbi.extensibility.IVisualEventService;
    private root: HTMLElement;
    private fs: VisualFormattingSettingsModel;
    private service = new FormattingSettingsService();

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.root = document.createElement("div");
        this.root.className = "heatmap";
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        try {
            const dv = options.dataViews && options.dataViews[0];
            this.fs = this.service.populateFormattingSettingsModel(VisualFormattingSettingsModel, dv);
            const s = this.fs;
            const m: any = dv && dv.matrix;
            this.root.textContent = "";
            this.root.style.fontFamily = fontStack(s.lettertype.familie.value);
            if (!m || !m.rows || !m.columns) { this.events.renderingFinished(options); return; }

            const kolommen: any[] = (m.columns.root.children || []);
            const rijen: any[] = (m.rows.root.children || []);
            const waardeKolom: any = m.valueSources && m.valueSources[0];
            const formaat: string | undefined = waardeKolom && waardeKolom.format;
            const cellen: (number | null)[][] = rijen.map(r => kolommen.map((_, ci) => {
                const c = r.values && r.values[ci];
                return c && c.value !== null && c.value !== undefined ? Number(c.value) : null;
            }));
            const alle = cellen.reduce((a: number[], r) => a.concat(r.filter(v => v !== null) as number[]), []);
            const min = alle.length ? Math.min(...alle) : 0;
            const max = alle.length ? Math.max(...alle) : 0;
            const bereik = max - min || 1;

            const raster = document.createElement("div");
            raster.className = "raster";
            const rijkop = s.koppen.rijkopBreedte.value > 0 ? `${s.koppen.rijkopBreedte.value}px` : "max-content";
            raster.style.gridTemplateColumns = `${rijkop} repeat(${kolommen.length}, minmax(0, 1fr))`;
            raster.style.gridTemplateRows = `auto repeat(${rijen.length}, minmax(0, 1fr))`;
            raster.style.gap = `${s.cellen.ruimte.value}px`;

            const kop = (tekst: string, rijKop: boolean) => {
                const e = document.createElement("div");
                e.className = "kop" + (rijKop ? " rij" : "");
                e.textContent = tekst;
                e.style.fontSize = `${s.koppen.grootte.value}pt`;
                e.style.color = s.koppen.kleur.value.value;
                e.style.fontWeight = s.koppen.vet.value ? "700" : "400";
                return e;
            };
            raster.appendChild(document.createElement("div"));
            kolommen.forEach(k => raster.appendChild(kop(formatteer(k.value), false)));
            rijen.forEach((r, ri) => {
                raster.appendChild(kop(formatteer(r.value), true));
                kolommen.forEach((k, ci) => {
                    const v = cellen[ri][ci];
                    const e = document.createElement("div");
                    e.className = "cel";
                    e.style.borderRadius = `${s.cellen.radius.value}px`;
                    e.style.fontSize = `${s.cellen.grootte.value}pt`;
                    e.style.fontWeight = s.cellen.vet.value ? "700" : "400";
                    const leeg = v === null || (v === 0 && s.cellen.nullAlsLeeg.value);
                    if (leeg) {
                        e.style.background = s.kleuren.leeg.value.value;
                    } else {
                        const t = ((v as number) - min) / bereik;
                        e.style.background = verloop(s.kleuren.laag.value.value, s.kleuren.midden.value.value, s.kleuren.hoog.value.value, t);
                        e.style.color = t > s.kleuren.drempel.value ? s.kleuren.tekstLicht.value.value : s.kleuren.tekstDonker.value.value;
                        if (s.cellen.toonWaarden.value) { e.textContent = formatCode(v, s.cellen.notatie.value, formaat); }
                        e.title = `${formatteer(r.value)} - ${formatteer(k.value)}: ${formatCode(v, s.cellen.notatie.value, formaat)}`;
                    }
                    raster.appendChild(e);
                });
            });
            this.root.appendChild(raster);

            if (s.legenda.toon.value) {
                const l = document.createElement("div");
                l.className = "legenda";
                l.style.fontSize = `${s.legenda.grootte.value}pt`;
                l.style.color = s.legenda.kleur.value.value;
                const balk = `<div class="balk" style="background: linear-gradient(90deg, ${s.kleuren.laag.value.value}, ${s.kleuren.midden.value.value}, ${s.kleuren.hoog.value.value})"></div>`;
                l.innerHTML = `<span>${escapeHtml(formatCode(min, s.cellen.notatie.value, formaat))}</span>${balk}<span>${escapeHtml(formatCode(max, s.cellen.notatie.value, formaat))}</span>`;
                this.root.appendChild(l);
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
