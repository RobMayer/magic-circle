/* eslint-disable default-case */

/* COLORS */

const SRGB = {
    r: 0.2126,
    g: 0.7152,
    b: 0.0722
}

export const COLORSPACES = ['hex', 'rgb', 'hsv', 'hsl', 'hwk', 'cmyk', 'hcy', 'hsi', 'cmy'];

export const parse = (str) => {
    str = str.replaceAll("#", "");
    str = str.toLowerCase();
    if (str.length === 3) {
        return str.substr(0, 1).repeat(2) + str.substr(1, 1).repeat(2) + str.substr(2, 1).repeat(2) + "ff";
    }
    if (str.length === 4) {
        return str.substr(0, 1).repeat(2) + str.substr(1, 1).repeat(2) + str.substr(2, 1).repeat(2) + str.substr(3, 1).repeat(2);
    }
    if (str.length === 6) {
        return str.substr(0, 2) + str.substr(2, 2) + str.substr(4, 2) + "ff";
    }
    if (str.length === 8) {
        return str.substr(0, 2) + str.substr(2, 2) + str.substr(4, 2) + str.substr(6, 2);
    }
    return null;
}

const convert = COLORSPACES.reduce((acc, from) => {
    COLORSPACES.forEach((to) => {
        if (from !== to) {
            if (from === "rgb") {
                acc[`${from}2${to}`] = (input) => {
                    return convFNs[`to${to.toUpperCase()}`](input);
                }
            } else if (to === "rgb") {
                acc[`${from}2${to}`] = (input) => {
                    return convFNs[`from${from.toUpperCase()}`](input);
                }
            } else {
                acc[`${from}2${to}`] = (input) => {
                    const t = convFNs[`from${from.toUpperCase()}`](input);
                    return convFNs[`to${to.toUpperCase()}`](t);
                }
            }
        }
    })
    return acc;
}, {})

const convFNs = {
    fromHEX: (hex) => {
        hex = parse(hex);
        if (hex === null) { return null; }
        const r = Number.parseInt(hex.substr(0, 2), 16) / 255;
        const g = Number.parseInt(hex.substr(2, 2), 16) / 255;
        const b = Number.parseInt(hex.substr(4, 2), 16) / 255;
        const a = Number.parseInt(hex.substr(6, 2), 16) / 255;
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
            return null;
        }
        return [r, g, b, a];
    },
    toHEX: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        return "" +
            Math.round(r * 255).toString(16).toLowerCase().padStart(2, "0") +
            Math.round(g * 255).toString(16).toLowerCase().padStart(2, "0") +
            Math.round(b * 255).toString(16).toLowerCase().padStart(2, "0") +
            Math.round(a * 255).toString(16).toLowerCase().padStart(2, "0");
    },
    toCMYK: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const max = Math.max(r, g, b);
        const c = max === 0 ? 0 : (max - r) / max;
        const m = max === 0 ? 0 : (max - g) / max;
        const y = max === 0 ? 0 : (max - b) / max;
        const k = 1 - max;
        return [c, m, y, k, a];
    },
    fromCMYK: (input) => {
        const [c, m, y, k, a] = clampAll(0, 1, ...(input.length === 5 ? input : [...input, 1]));
        const r = (1 - c) * (1 - k);
        const g = (1 - m) * (1 - k);
        const b = (1 - y) * (1 - k);
        return [r, g, b, a];
    },
    toCMY: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const c = 1 - r;
        const m = 1 - g;
        const y = 1 - b;
        return [c, m, y, a];
    },
    fromCMY: (input) => {
        const [c, m, y, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const r = 1 - c;
        const g = 1 - m;
        const b = 1 - y;
        return [r, g, b, a];
    },
    toHSL: (rgba) => {
        const [r, g, b, a] = clampAll(0, 1, rgba[0], rgba[1], rgba[2], rgba?.[3] ?? 1);
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const h = hue(r, g, b);
        const s = (max === min) ? 0 : (max - min) / (1 - Math.abs((min + max) - 1));
        const l = (max + min) / 2;
        return [h, s, l, a]
    },
    fromHSL: (input) => {
        const h = wrap(input.shift(), 0, 1);
        const [s, l, a] = clampAll(0, 1, ...(input.length === 3 ? input : [...input, 1]));
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const tX = (c / 2) + l;
        const tY = (c * (1 - Math.abs((h * 6) % 2 - 1))) + (l - c / 2);
        const tZ = l - c / 2;

        switch (Math.floor(h * 6)) {
            case 0:
                return [tX, tY, tZ, a];
            case 1:
                return [tY, tX, tZ, a];
            case 2:
                return [tZ, tX, tY, a];
            case 3:
                return [tZ, tY, tX, a];
            case 4:
                return [tY, tZ, tX, a];
            case 5:
                return [tX, tZ, tY, a];
        }
        return null;
    },
    toHCY: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const h = hue(r, g, b);
        const c = Math.max(r, g, b) - Math.min(r, g, b);
        const y = r * SRGB.r + g * SRGB.g + b * SRGB.b;
        return [h, c, y, a];
    },
    fromHCY: (input) => {
        const h = wrap(input.shift(), 0, 1);
        const [c, y, a] = clampAll(0, 1, ...(input.length === 3 ? input : [...input, 1]));
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const res = { r: 0, b: 0, g: 0, a };

        switch (Math.floor(h * 6) % 6) {
            case 0:
                res.r = c; res.g = x; res.b = 0; break;
            case 1:
                res.r = x; res.g = c; res.b = 0; break;
            case 2:
                res.r = 0; res.g = c; res.b = x; break;
            case 3:
                res.r = 0; res.g = x; res.b = c; break;
            case 4:
                res.r = x; res.g = 0; res.b = c; break;
            case 5:
                res.r = c; res.g = 0; res.b = x; break;
        }
        const m = y - (SRGB.r * res.r + SRGB.g * res.g + SRGB.b * res.b);
        return [res.r + m, res.g + m, res.b + m, a];
    },
    toHSV: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const h = hue(r, g, b);
        const s = (max === 0) ? 0 : (max - min) / max;
        const v = max;
        return [h, s, v, a];
    },
    fromHSV: (input) => {
        const h = wrap(input.shift(), 0, 1);
        const [s, v, a] = clampAll(0, 1, ...(input.length === 3 ? input : [...input, 1]));

        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));

        const res = { r: 0, b: 0, g: 0, a };

        switch (Math.floor(h * 6) % 6) {
            case 0:
                res.r = c; res.g = x; res.b = 0; break;
            case 1:
                res.r = x; res.g = c; res.b = 0; break;
            case 2:
                res.r = 0; res.g = c; res.b = x; break;
            case 3:
                res.r = 0; res.g = x; res.b = c; break;
            case 4:
                res.r = x; res.g = 0; res.b = c; break;
            case 5:
                res.r = c; res.g = 0; res.b = x; break;
        }
        const m = v - c;
        return [res.r + m, res.g + m, res.b + m, a];
    },
    toHWK: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const h = hue(r, g, b);
        const w = Math.min(r, g, b);
        const k = 1 - Math.max(r, g, b);
        return [h, w, k, a];
    },
    fromHWK: (input) => {
        const h = wrap(input.shift(), 0, 1);
        const [w, k, a] = clampAll(0, 1, ...(input.length === 3 ? input : [...input, 1]));
        const z = w + k;
        if (k === 1) { return [0, 0, 0, a]; }
        const s = 1 - (z > 1 ? w / z : w) / (1 - (z > 1 ? k / z : k));
        const v = 1 - (z > 1 ? k / z : k);
        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));

        const res = { r: 0, b: 0, g: 0, a };

        switch (Math.floor(h * 6) % 6) {
            case 0:
                res.r = c; res.g = x; res.b = 0; break;
            case 1:
                res.r = x; res.g = c; res.b = 0; break;
            case 2:
                res.r = 0; res.g = c; res.b = x; break;
            case 3:
                res.r = 0; res.g = x; res.b = c; break;
            case 4:
                res.r = x; res.g = 0; res.b = c; break;
            case 5:
                res.r = c; res.g = 0; res.b = x; break;
        }
        const m = v - c;
        return [res.r + m, res.g + m, res.b + m, a];
    },
    toHSI: (input) => {
        const [r, g, b, a] = clampAll(0, 1, ...(input.length === 4 ? input : [...input, 1]));
        const h = hue(r, g, b);
        const i = (r + g + b) / 3.0;
        const s = i === 0 ? 0 : 1 - Math.min(r, g, b) / i;
        return [h, s, i, a]
    },
    fromHSI: (input) => {
        const h = wrap(input.shift(), 0, 1);
        const [s, i, a] = clampAll(0, 1, ...(input.length === 3 ? input : [...input, 1]));
        const z = 1 - Math.abs((h * 6) % 2 - 1);
        const c = (3 * i * s) / (1 + z);
        const x = c * z;

        const res = { r: 0, b: 0, g: 0, a };

        switch (Math.floor(h * 6) % 6) {
            case 0:
                res.r = c; res.g = x; res.b = 0; break;
            case 1:
                res.r = x; res.g = c; res.b = 0; break;
            case 2:
                res.r = 0; res.g = c; res.b = x; break;
            case 3:
                res.r = 0; res.g = x; res.b = c; break;
            case 4:
                res.r = x; res.g = 0; res.b = c; break;
            case 5:
                res.r = c; res.g = 0; res.b = x; break;
        }
        const m = i * (1 - s);
        return [res.r + m, res.g + m, res.b + m, a]
    }
}

export const mod = (value, n) => {
    return ((value % n) + n) % n;
}

export const wrap = (value, min, max) => {
    const end = Math.max(min, max);
    const start = Math.min(min, max);
    const range = end - start;
    return mod((value - start), range) + start;
}

const hue = (r, g, b) => {
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    if (max !== min) {
        if (max === r) { return wrap((g - b) / (max - min), 0, 6) / 6.0 }
        if (max === g) { return wrap(((b - r) / (max - min)) + 2, 0, 6) / 6.0 }
        if (max === b) { return wrap(((r - g) / (max - min)) + 4, 0, 6) / 6.0 }
    }
    return 0;
}

export const clamp = (val, min, max) => {
    return Math.min(max, Math.max(min, val));
}

export const clampAll = (min, max, ...values) => {
    return values.map((each) => {
        return clamp(each, min, max);
    })
}

export const COLORSPACE_NAMES = {
    rgb: "RGB",
    cmyk: "CMYK",
    hsv_closest: "HSV (Closest Hue)",
    hsv_farthest: "HSV (Farthest Hue)",
    hsv_plus: "HSV (Positive Hue)",
    hsv_minus: "HSV (Negative Hue)",
    hsl_closest: "HSL (Closest Hue)",
    hsl_farthest: "HSL (Farthest Hue)",
    hsl_plus: "HSL (Positive Hue)",
    hsl_minus: "HSL (Negative Hue)",
    hwv_closest: "HWK (Closest Hue)",
    hwv_farthest: "HWK (Farthest Hue)",
    hwv_plus: "HWK (Positive Hue)",
    hwv_minus: "HWK (Negative Hue)",
    hcy_closest: "HCY (Closest Hue)",
    hcy_farthest: "HCY (Farthest Hue)",
    hcy_plus: "HCY (Positive Hue)",
    hcy_minus: "HCY (Negative Hue)",
    hsi_closest: "HSI (Closest Hue)",
    hsi_farthest: "HSI (Farthest Hue)",
    hsi_plus: "HSI (Positive Hue)",
    hsi_minus: "HSI (Negative Hue)"
}

/* CURVES */

const generateCurves = (key, func) => {
    return {
        [`${key}_in`] : a => func(a),
        [`${key}_out`] : a => 1 - func(1 - a),
        [`${key}_inout`] : a => a < 0.5 ? func(a * 2) / 2 : a > 0.5 ? 1 - func(a * -2 + 2) / 2 : 0.5,
        [`${key}_outin`] : a => a < 0.5 ? 0.5 - func(1 - a * 2) / 2 : a > 0.5 ? 0.5 + func(a * 2 - 1) / 2 : 0.5
    }
}

const nameCurves = (key, name) => {
    return {
        [`${key}_in`] : `${name} In`,
        [`${key}_out`] : `${name} Out`,
        [`${key}_inout`] : `${name} In-Out`,
        [`${key}_outin`] : `${name} Out-In`
    }
}

export const CURVES = {
    linear: a => a,
    ...generateCurves("quadratic", a => Math.pow(a, 2)),
    ...generateCurves("cubic", a => Math.pow(a, 3)),
    ...generateCurves("semiquadratic", a => Math.pow(a, 1.5)),
    ...generateCurves("exponential", a => Math.pow(2, a) - 1),
    ...generateCurves("sinic", a => Math.sin(a * (Math.PI / 2))),
    ...generateCurves("cosinic", a => -1 * Math.cos(a * (Math.PI / 2)) + 1),
    ...generateCurves("rootic", a => Math.sqrt(a))
}

export const CURVE_NAMES = {
    linear: "Linear",
    ...nameCurves("quadratic", "Quadratic"),
    ...nameCurves("cubic", "Cubic"),
    ...nameCurves("semiquadratic", "Semi-Quadratic"),
    ...nameCurves("exponential", "Exponential"),
    ...nameCurves("sinic", "Sine Curve"),
    ...nameCurves("cosinic", "Cosine Curve"),
    ...nameCurves("rootic", "Square Root")
}

export const lerp = (t, a, b, curve = "linear") => {
    if (!(curve in CURVES)) { curve = "linear"; }
    t = CURVES[curve](t);
    return a + t * (b - a);
}

export const delerp = (d, start, end) => {
    return (end - start) === 0 ? 0 : (d - start) / (end - start);
}

export const DIRECTIONS = ["closest", "farthest", "closestplus", "closestminus", "farthestplus", "farthestminus", "plus", "minus"];

export const clerp = (t, a, b, mode = "closestplus") => {
    if (DIRECTIONS.includes(mode)) {
        if (mode === "closest") { mode = "closestplus"; }
        if (mode === "farthest") { mode = "farthestplus"; }
        if (mode === "closestplus") { mode = Math.abs(b - a) > 0.5 ? "minus" : "plus"; }
        if (mode === "closestminus") { mode = Math.abs(b - a) >= 0.5 ? "minus" : "plus"; }
        if (mode === "farthestplus") { mode = Math.abs(b - a) >= 0.5 ? "plus" : "minus"; }
        if (mode === "farthestminus") { mode = Math.abs(b - a) > 0.5 ? "plus" : "minus"; }
        if (mode === "plus") {
            return mod(lerp(t, a, b + (a > b ? 1 : 0)), 1);
        }
        if (mode === "minus") {
            return mod(lerp(t, a + (a < b ? 1 : 0), b), 1);
        }
    }
    return null;
}

export const colorlerp = (step, from, to, colorspace = "rgb", curve = "linear") => {
    colorspace = colorspace.toLowerCase().split("_");
    from = parse(from);
    to = parse(to);
    if (!(curve in CURVES)) { curve = "linear"; }
    step = CURVES[curve](step);
    const space = colorspace[0];
    const dir = colorspace?.[1] ?? "closest";
    if (!COLORSPACES.includes(space) || space === "hex" || !DIRECTIONS.includes(dir) || from === null || to === null) {
        return null;
    }

    if (space === "rgb") {
        const src = convert.hex2rgb(from);
        const dst = convert.hex2rgb(to);
        return convert.rgb2hex([0, 1, 2, 3].map((i) => {
            return lerp(step, src[i], dst[i])
        }))
    } else if (space === "cmyk") {
        const src = convert.hex2cmyk(from);
        const dst = convert.hex2cmyk(to);
        return convert.cmyk2hex([0, 1, 2, 3, 4].map((i) => {
            return lerp(step, src[i], dst[i])
        }))
    } else if (space === "cmy") {
        const src = convert.hex2cmy(from);
        const dst = convert.hex2cmy(to);
        return convert.cmy2hex([0, 1, 2, 3].map((i) => {
            return lerp(step, src[i], dst[i])
        }))
    } else if (space === "hsv") {
        const src = convert.hex2hsv(from);
        const dst = convert.hex2hsv(to);
        return convert.hsv2hex([
            clerp(step, src[0], dst.[0], dir),
            ...[1, 2, 3].map((i) => {
                return lerp(step, src[i], dst[i])
            })
        ])
    } else if (space === "hsl") {
        const src = convert.hex2hsl(from);
        const dst = convert.hex2hsl(to);
        return convert.hsl2hex([
            clerp(step, src[0], dst.[0], dir),
            ...[1, 2, 3].map((i) => {
                return lerp(step, src[i], dst[i])
            })
        ])
    } else if (space === "hwk") {
        const src = convert.hex2hwk(from);
        const dst = convert.hex2hwk(to);
        return convert.hwk2hex([
            clerp(step, src[0], dst.[0], dir),
            ...[1, 2, 3].map((i) => {
                return lerp(step, src[i], dst[i])
            })
        ])
    } else if (space === "hcy") {
        const src = convert.hex2hcy(from);
        const dst = convert.hex2hcy(to);
        return convert.hcy2hex([
            clerp(step, src[0], dst.[0], dir),
            ...[1, 2, 3].map((i) => {
                return lerp(step, src[i], dst[i])
            })
        ])
    } else if (space === "hsi") {
        const src = convert.hex2hsi(from);
        const dst = convert.hex2hsi(to);
        return convert.hsi2hex([
            clerp(step, src[0], dst.[0], dir),
            ...[1, 2, 3].map((i) => {
                return lerp(step, src[i], dst[i])
            })
        ])
    }
    return null;
}

const output = {
    lerp,
    delerp,
    colorlerp,
    clerp,
    CURVES,
    CURVE_NAMES,
    COLORSPACE_NAMES,
    parseColor: parse
}
export default output;
