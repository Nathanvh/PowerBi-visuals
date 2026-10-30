// Gedeelde huisstijl en hulpfuncties voor alle visuals. Bewust zonder externe imports.
export const KLEUR = {
    marine: "#111987", marineDonker: "#0c0f5a", oranje: "#dd7d32", oranjeDonker: "#c1561e",
    turkoois: "#66cccc", turkooisDonker: "#31959b", lichtblauw: "#e9f1ff", middenblauw: "#9fb4ff",
    felblauw: "#3650ff", tekst: "#262626", tekst2: "#525252", rand: "#E5E5E5", neutraal: "#D4D4D4",
    wit: "#FFFFFF", pagina: "#FAFAFA", lijn: "#F0F0F0"
};
export const REEKSKLEUREN = ["#111987", "#66cccc", "#dd7d32", "#3650ff", "#31959b", "#c1561e"];
export const LETTERTYPE = "Montserrat";

export function fontStack(familie: string): string {
    return `${familie || LETTERTYPE}, "Segoe UI", Arial, sans-serif`;
}


const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const DAGEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

/**
 * Datumopmaak die zowel Power BI-formaten (d mmmm, dd-mm-yyyy) als gewone codes (dd-MM-yyyy, HH:mm) begrijpt.
 * Tokens: yyyy yy mmmm mmm mm m dddd ddd dd d hh h nn ss s. "mm" is minuten als er een dubbele punt naast staat, anders maand.
 */
export function datumFormat(d: Date, fmt: string): string {
    const p = (n: number) => String(n).padStart(2, "0");
    const f = fmt || "dd-MM-yyyy";
    return f.replace(/yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|nn|ss|s/gi, (t, pos: number) => {
        const l = t.toLowerCase();
        switch (l) {
            case "yyyy": return String(d.getFullYear());
            case "yy": return String(d.getFullYear()).slice(2);
            case "mmmm": return MAANDEN[d.getMonth()];
            case "mmm": return MAANDEN[d.getMonth()].slice(0, 3);
            case "mm": case "m": {
                const minuut = f[pos - 1] === ":" || f[pos + t.length] === ":";
                const v = minuut ? d.getMinutes() : d.getMonth() + 1;
                return l === "mm" ? p(v) : String(v);
            }
            case "dddd": return DAGEN[d.getDay()];
            case "ddd": return DAGEN[d.getDay()].slice(0, 2);
            case "dd": return p(d.getDate());
            case "d": return String(d.getDate());
            case "hh": return p(d.getHours());
            case "h": return String(d.getHours());
            case "nn": return p(d.getMinutes());
            case "ss": return p(d.getSeconds());
            default: return String(d.getSeconds());
        }
    });
}

/** Zwart of wit, afhankelijk van de achtergrondkleur. */
export function tekstOp(achtergrond: string, donker = "#262626", licht = "#FFFFFF"): string {
    const [r, g, b] = hexNaarRgb(achtergrond);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.6 ? licht : donker;
}

/** Formatteert een waarde volgens het Power BI-formaat van de measure (nl-NL). */
export function formatteer(waarde: any, formaat?: string): string {
    if (waarde === null || waarde === undefined) { return ""; }
    if (waarde instanceof Date) { return formaat && !/^general/i.test(formaat) ? datumFormat(waarde, formaat) : waarde.toLocaleDateString("nl-NL"); }
    if (typeof waarde !== "number") { return String(waarde); }
    const f = formaat || "";
    const dec = (f.split(".")[1] || "").replace(/[^0#]/g, "").length;
    if (f.indexOf("%") >= 0) {
        return (waarde * 100).toLocaleString("nl-NL", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + "%";
    }
    return waarde.toLocaleString("nl-NL", {
        minimumFractionDigits: f ? dec : 0,
        maximumFractionDigits: f ? dec : (Number.isInteger(waarde) ? 0 : 2)
    });
}

/** Seconden naar m:ss */
export function mmss(sec: any): string {
    if (typeof sec !== "number" || !isFinite(sec)) { return ""; }
    const s = Math.round(sec);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Zoekt de kolom van een dataview (categorical) die bij een rol hoort. */
export function kolomVoorRol(dv: any, rol: string): any {
    const vals: any[] = dv && dv.categorical && dv.categorical.values ? dv.categorical.values : [];
    return vals.find(v => v.source && v.source.roles && v.source.roles[rol]);
}

export function hexNaarRgb(hex: string): [number, number, number] {
    const h = (hex || "#000000").replace("#", "");
    const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h.padEnd(6, "0");
    return [parseInt(v.substr(0, 2), 16), parseInt(v.substr(2, 2), 16), parseInt(v.substr(4, 2), 16)];
}

export function mengKleur(a: string, b: string, t: number): string {
    const x = hexNaarRgb(a), y = hexNaarRgb(b);
    const c = x.map((v, i) => Math.round(v + (y[i] - v) * t));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Drie-puntsverloop laag -> midden -> hoog, t tussen 0 en 1. */
export function verloop(laag: string, midden: string, hoog: string, t: number): string {
    const k = Math.max(0, Math.min(1, t));
    return k < 0.5 ? mengKleur(laag, midden, k * 2) : mengKleur(midden, hoog, (k - 0.5) * 2);
}

export function isHex(s: string): boolean { return /^#[0-9a-fA-F]{3,8}$/.test((s || "").trim()); }

export function escapeHtml(s: string): string {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" } as any)[c]);
}

/** Maakt instellingen-helpers; krijgt de formattingSettings-namespace mee zodat dit bestand geen imports nodig heeft. */
export function instellingenHelpers(fs: any) {
    return {
        num: (name: string, displayName: string, value: number) => new fs.NumUpDown({ name, displayName, value }),
        kleur: (name: string, displayName: string, value: string) => new fs.ColorPicker({ name, displayName, value: { value } }),
        schakel: (name: string, displayName: string, value: boolean) => new fs.ToggleSwitch({ name, displayName, value }),
        tekst: (name: string, displayName: string, value: string, placeholder = "") => new fs.TextInput({ name, displayName, value, placeholder }),
        keuze: (name: string, displayName: string, items: { value: string, displayName: string }[], waarde: string) =>
            new fs.ItemDropdown({ name, displayName, items, value: items.find(i => i.value === waarde) || items[0] })
    };
}

/** Seconden naar u:mm:ss */
export function hms(sec: any): string {
    if (typeof sec !== "number" || !isFinite(sec)) { return ""; }
    const s = Math.round(sec);
    return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Formatteert met een zelf ingetypte notatiecode; leeg = formaat van het veld (terugval).
 * Getallen: 0 | 0.0 | 0.00 | #,0 (duizendtallen) | 0% | 0.0% ; duur in seconden: m:ss | mm:ss | h:mm:ss | uu:mm:ss
 * Datums/tijden: bijvoorbeeld dd-MM-yyyy, dd-MM, HH:mm
 */
export function formatCode(waarde: any, code?: string, terugval?: string): string {
    const c = (code || "").trim();
    if (!c) { return formatteer(waarde, terugval); }
    if (waarde === null || waarde === undefined) { return ""; }
    const l = c.toLowerCase();
    if (typeof waarde === "number") {
        if (l === "m:ss" || l === "mm:ss") { return mmss(waarde); }
        if (l === "h:mm:ss" || l === "hh:mm:ss" || l === "u:mm:ss" || l === "uu:mm:ss") { return hms(waarde); }
        const dec = (c.split(".")[1] || "").replace(/[^0#]/g, "").length;
        const pct = c.indexOf("%") >= 0;
        return (pct ? waarde * 100 : waarde).toLocaleString("nl-NL", {
            minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: c.indexOf(",") >= 0
        }) + (pct ? "%" : "");
    }
    if (waarde instanceof Date) { return datumFormat(waarde, c); }
    return String(waarde);
}

/** "Naam=code; Naam2=code2" naar een opzoeklijst (namen in kleine letters). */
export function leesNotaties(tekst: string): { [naam: string]: string } {
    const uit: { [naam: string]: string } = {};
    (tekst || "").split(/[;\n]/).forEach(p => {
        const i = p.indexOf("=");
        if (i > 0) { uit[p.substring(0, i).trim().toLowerCase()] = p.substring(i + 1).trim(); }
    });
    return uit;
}
