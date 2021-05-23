import { get } from 'lodash';
import interpolation from './interpolation';
import Gradient from './gradient';
import Spline from './spline';

const COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

const CURVES = Object.keys(interpolation.CURVES);

export const EFFECTS = {
    sketch: {
        term: "Sketch",
        validate: (data, path) => {
            return {
                type: "sketch",
                seed: checkValue(data, [...path, 'seed'], Math.round(Math.random() * 1000), isInteger),
                shake: checkValue(data, [...path, 'shake'], 0.2, isGTE(0), isLTE(1)),
                nib: checkLength(data, [...path, 'nib'], 1, 1),
            }
        }
    },
    pen: {
        term: "Pen",
        validate: (data, path) => {
            return {
                type: "pen",
                nib: checkLength(data, [...path, 'nib'], 1, 1),
                seed: checkValue(data, [...path, 'seed'], Math.round(Math.random() * 1000), isInteger),
                smudge: checkValue(data, [...path, 'smudge'], 0.2, isGTE(0), isLTE(1)),
                jitter: checkValue(data, [...path, 'jitter'], 0.5, isGTE(0), isLTE(1))
            }
        }
    },
    pencil: {
        term: "Pencil",
        validate: (data, path) => {
            return {
                type: "pencil",
                seed: checkValue(data, [...path, 'seed'], Math.round(Math.random() * 1000), isInteger)
            }
        }
    },
    glow: {
        term: "Glow",
        validate: (data, path) => {
            return {
                type: "glow",
                blur: checkValue(data, [...path, 'blur'], 3, isNumber),
                spread: checkLength(data, [...path, 'spread'], 3, 1),
            }
        }
    }
}

export const LAYERS = {
    line:  {
        term: "Line",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "line",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r1: checkLength(data, [...path, 'r1'], 0, 96),
                t1: checkValue(data, [...path, 't1'], 0, isNumber),
                x1: checkLength(data, [...path,'x1'], 0, 96),
                y1: checkLength(data, [...path,'y1'], 0, 96),
                r2: checkLength(data, [...path,'r2'], 0, 96),
                t2: checkValue(data, [...path, 't2'], 0, isNumber),
                x2: checkLength(data, [...path, 'x2'], 0, 96),
                y2: checkLength(data, [...path, 'y2'], 0, 96),
                stroke: checkStroke(data, [...path, 'stroke'])
            }
        }
    },
    circle: {
        term: "Circle",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "circle",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                radius: checkLengthWithScale(data, [...path, 'radius'], 2, 96, true, isNumber),
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    ring:  {
        term: "Ring",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "ring",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                inner: checkLengthWithScale(data, [...path, 'inner'], 1, 96, true, isNumber),
                outer: checkLengthWithScale(data, [...path, 'outer'], 2, 96, true, isNumber),
                radius: checkLengthWithScale(data, [...path, 'radius'], 1.5, 96, true, isNumber),
                spread: checkLengthWithScale(data, [...path, 'spread'], 0.5, 96, true, isNumber),
                radialMode: checkValue(data, [...path, 'radialMode'], "innerouter", isEnum("innerouter", "radiusspread")),
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    polygon: {
        term: "Polygon",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "polygon",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                radius: checkPolygonRadius(data, [...path, 'radius'], 1.5, 96, true, isGTE(0)),
                scribeMode: checkValue(data, [...path, "scribeMode"], "circumscribe", isLegacy([...path, "radius", "scribe"]), isEnum("circumscribe", "inscribe", "middle")),
                sides: checkValue(data, [...path, 'sides'], 5, isInteger, isGTE(3), isLTE(24)),
                thetaCurve: checkValue(data, [...path, 'thetaCurve'], "linear", isEnum(...CURVES)),
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    polygram: {
        term: "Polygram",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "polygram",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                radius: checkPolygonRadius(data, [...path, 'radius'], 1.5, 96, true, isGTE(0)),
                scribeMode: checkValue(data, [...path, "scribeMode"], "circumscribe", isLegacy([...path, "radius", "scribe"]), isEnum("circumscribe", "inscribe", "middle")),
                sides: checkValue(data, [...path, 'sides'], 5, isInteger, isGTE(5), isLTE(24)),
                skip: checkValue(data, [...path, 'skip'], 1, isInteger, isGTE(0), isLTE(Math.ceil(checkValue(data, [...path, 'sides'], 5, isGTE(5), isLTE(24)) / 2) - 2)),
                thetaCurve: checkValue(data, [...path, 'thetaCurve'], "linear", isEnum(...CURVES)),
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    burst: {
        term: "Burst",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "burst",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                count: checkValue(data, [...path, 'count'], 5, isInteger),
                radialMode: checkValue(data, [...path, 'radialMode'], 'innerouter', isEnum("radiusspread", "innerouter")),
                inner: checkLengthWithScale(data, [...path, 'inner'], 0, 96, true, isNumber),
                outer: checkLengthWithScale(data, [...path, 'outer'], 1.5, 96, true, isNumber),
                radius: checkLengthWithScale(data, [...path, 'radius'], 1.5, 96, true, isNumber),
                spread: checkLengthWithScale(data, [...path, 'spread'], 0.5, 96, true, isNumber),
                thetaMode: checkValue(data, [...path, 'thetaMode'], 'incremental', isEnum("incremental", "startstop")),
                step: checkValue(data, [...path, 'step'], 72, isNumber),
                toExtent: checkValue(data, [...path, 'toExtent'], false, isBoolean),
                coverage: {
                    start: checkValue(data, [...path, 'coverage', 'start'], 0, isNumber),
                    end: checkValue(data, [...path, 'coverage', 'end'], 360, isNumber),
                },
                thetaCurve: checkValue(data, [...path, 'thetaCurve'], "linear", isEnum(...CURVES)),
                stroke: checkStroke(data, [...path, 'stroke']),
            }
        }
    },
    arc:  {
        term: "Arc",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "arc",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                radius: checkLengthWithScale(data, [...path, 'radius'], 1.5, 96, true, isNumber),
                pie: checkValue(data, [...path, 'pie'], false, isBoolean),
                coverage: {
                    start: checkValue(data, [...path, 'coverage', 'start'], 0, isLTE(360), isGTE(0)),
                    end: checkValue(data, [...path, 'coverage', 'end'], 60, isLTE(360), isGTE(0)),
                },
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    star: {
        term: "Star",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "star",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                points: checkValue(data, [...path, 'points'], 5, isInteger),
                scribeMode: checkValue(data, [...path, 'scribeMode'], 'circumscribe', isEnum('circumscribe', 'inscribe', 'middle')),
                radialMode: checkValue(data, [...path, 'radialMode'], 'innerouter', isEnum("radiusspread", "innerouter")),
                inner: checkLengthWithScale(data, [...path, 'inner'], 0.75, 96, true, isNumber),
                outer: checkLengthWithScale(data, [...path, 'outer'], 2, 96, true, isNumber),
                radius: checkLengthWithScale(data, [...path, 'radius'], 1.5, 96, true, isNumber),
                spread: checkLengthWithScale(data, [...path, 'spread'], 0.5, 96, true, isNumber),
                thetaCurve: checkValue(data, [...path, 'thetaCurve'], "linear", isEnum(...CURVES)),
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    path: {
        term: "Path",
        warning: "Proceed with Caution!",
        category: "shape",
        validate: (data, path) => {
            return {
                type: "path",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                s: checkValue(data, [...path, 's'], 1, isNumber),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                definition: checkValue(data, [...path, 'definition'], "", isString),
                stroke: checkStroke(data, [...path, 'stroke']),
                fill: checkFill(data, [...path, 'fill'])
            }
        }
    },
    group: {
        term: "Group",
        category: "collection",
        validate: (data, path) => {
            return {
                type: "group",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                layers: checkLayers(data, [...path, 'layers'])
            }
        }
    },
    radialary: {
        term: "Radial Array",
        category: "collection",
        validate: (data, path) => {
            return {
                type: "radialary",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                count: checkValue(data, [...path, 'count'], 3, isInteger),
                radialMode: checkValue(data, [...path, 'radialMode'], 'innerouter', isEnum("radiusspread", "innerouter")),
                inner: checkLengthWithScale(data, [...path, 'inner'], 1, 96, true, isNumber),
                outer: checkLengthWithScale(data, [...path, 'outer'], 2, 96, true, isNumber),
                radius: checkLengthWithScale(data, [...path, 'radius'], 1.5, 96, true, isNumber),
                spread: checkLengthWithScale(data, [...path, 'spread'], 0.5, 96, true, isNumber),
                thetaMode: checkValue(data, [...path, 'thetaMode'], 'incremental', isEnum("incremental", "startstop")),
                step: checkValue(data, [...path, 'step'], 20, isNumber),
                toExtent: checkValue(data, [...path, 'toExtent'], false, isBoolean),
                coverage: {
                    start: checkValue(data, [...path, 'coverage', 'start'], 0, isNumber),
                    end: checkValue(data, [...path, 'coverage', 'end'], 360, isNumber),
                },
                scaleFactor: checkValue(data, [...path, 'scaleFactor'], "1 0,linear,1 1", isSpline),
                radialCurve: checkValue(data, [...path, 'radialCurve'], "linear", isEnum(...CURVES)),
                scaleCurve: checkValue(data, [...path, 'scaleCurve'], "linear", isEnum(...CURVES)),
                thetaCurve: checkValue(data, [...path, 'thetaCurve'], "linear", isEnum(...CURVES)),
                colorFactorInherit: checkValue(data, [...path, 'colorFactorInherit'], false, isBoolean),
                colorFactorFill: checkValue(data, [...path, 'colorFactorFill'], "#ffffffff 0,rgb linear,#000000ff 1", isGradient),
                colorFactorStroke: checkValue(data, [...path, 'colorFactorStroke'], "#ffffffff 0,rgb linear,#000000ff 1", isGradient),
                layers: checkLayers(data, [...path, 'layers'])
            }
        }
    },
    vertexary: {
        term: "Vertex Array",
        category: "collection",
        validate: (data, path) => {
            return {
                type: "vertexary",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                radius: checkPolygonRadius(data, [...path, 'radius'], 1.5, 96, true, isGTE(0)),
                scribeMode: checkValue(data, [...path, "scribeMode"], "circumscribe", isLegacy([...path, "radius", "scribe"]), isEnum("circumscribe", "inscribe", "middle")),
                count: checkValue(data, [...path, 'count'], 5, isInteger),
                scaleFactor: checkValue(data, [...path, 'scaleFactor'], "1 0,linear,1 1", isSpline),
                thetaCurve: checkValue(data, [...path, 'thetaCurve'], "linear", isEnum(...CURVES)),
                colorFactorInherit: checkValue(data, [...path, 'colorFactorInherit'], false, isBoolean),
                colorFactorFill: checkValue(data, [...path, 'colorFactorFill'], "#ffffffff 0,rgb linear,#000000ff 1", isGradient),
                colorFactorStroke: checkValue(data, [...path, 'colorFactorStroke'], "#ffffffff 0,rgb linear,#000000ff 1", isGradient),
                layers: checkLayers(data, [...path, 'layers'])
            }
        }
    },
    mask: {
        term: "Mask",
        category: "utility",
        validate: (data, path) => {
            return {
                type: "mask",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                invertMask: checkValue(data, [...path, 'invertMask'], false, isBoolean),
                showMask: checkValue(data, [...path, 'showMask'], false, isBoolean),
                masks: checkLayers(data, [...path, 'masks']),
                layers: checkLayers(data, [...path, 'layers'])
            }
        }
    },
    effect: {
        term: "Effect",
        category: "utility",
        validate: (data, path) => {
            return {
                type: "effect",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                posMode: checkValue(data, [...path, "posMode"], "polar", isEnum("cartesian", "polar")),
                r: checkLength(data, [...path, 'r'], 0, 96),
                t: checkValue(data, [...path, 't'], 0, isNumber),
                x: checkLength(data, [...path, 'x'], 0, 96),
                y: checkLength(data, [...path, 'y'], 0, 96),
                rotation: checkValue(data, [...path, 'rotation'], 0, isNumber),
                showEffect: checkValue(data, [...path, 'showEffect'], true, isBoolean),
                definition: checkEffect(data, [...path, 'definition']),
                layers: checkLayers(data, [...path, 'layers'])
            }
        }
    },
    recolor: {
        term: "Recolor",
        category: "utility",
        validate: (data, path) => {
            return {
                type: "recolor",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], true, isBoolean),
                visible: checkValue(data, [...path, "visible"], true, isBoolean),
                foreground: checkValue(data, [...path, 'foreground'], "#800", isColor),
                background: checkValue(data, [...path, 'background'], "#fff", isColor),
                layers: checkLayers(data, [...path, 'layers'])
            }
        }
    },
    note: {
        term: "Note",
        category: "utility",
        validate: (data, path) => {
            return {
                type: "note",
                name: checkValue(data, [...path, "name"], "", isString),
                isOpen: checkValue(data, [...path, "isOpen"], false, isBoolean),
                note: checkValue(data, [...path, "note"], "", isString)
            }
        }
    }
}

export const isString = a => typeof a === "string" ? a : undefined;
export const isGradient = a => typeof a === "string" ? (Gradient.fromString(a)?.toString() ?? undefined) : undefined;
export const isSpline = a => typeof a === "string" ? (Spline.fromString(a)?.toString() ?? undefined) : undefined;
export const isLiteral = (c) => { return a => a === c ? a : undefined; };
export const isNull = (a) => { return a === null ? a : typeof a === 'string' && a === '' ? null : undefined }
export const isColor = a => typeof a === "string" && COLOR_REGEX.test(a) ? a : undefined;
export const isNumber = a => !isNaN(Number(a)) ? Number(a) : undefined;
export const isEnum = (...values) => { return a => values.includes(a) ? a : undefined; }
export const isGT = (c) => { return a => Number(a) > c ? Number(a) : undefined }
export const isLT = (c) => { return a => Number(a) < c ? Number(a) : undefined }
export const isGTE = (c) => { return a => Number(a) >= c ? Number(a) : undefined }
export const isLTE = (c) => { return a => Number(a) <= c ? Number(a) : undefined }
export const isArray = a => Array.isArray(a) ? a : undefined;
export const isInteger = a => !isNaN(Number(a)) ? Math.round(a) : undefined;
export const isLegacy = (path) => {
    return (a, data) => a ?? get(path, undefined)
}
export const isBoolean = (a) => {
    if (a === true) { return true; }
    if (a === false) { return false; }
    if (a === 1) { return true; }
    if (a === 0) { return false; }
    if (typeof a === 'string') {
        if (a.toLowerCase() === "true") { return true; }
        if (a.toLowerCase() === "false") { return false; }
    }
    return undefined;
};

const checkValue = (data, path, fallback, ...funcs) => {
    const t = funcs.reduce((acc, func) => {
        if (acc === undefined) { return undefined; }
        return func(acc, data);
    }, get(data, path));
    if (t === undefined) {
        return fallback;
    }
    return t;
}

const checkStroke = (data, path) => {
    return {
        option: checkValue(data, [...path, 'option'], 'foreground', isEnum("foreground", "background", "none", "custom", "tween")),
        color: checkValue(data, [...path, 'color'], '#000', isColor),
        value: checkValue(data, [...path, 'value'], 1, isGTE(0)),
        unit: checkValue(data, [...path, 'unit'], 1, isEnum(1, 96, 25.4, 2.54)),
        useScale: checkValue(data, [...path, 'useScale'], false, isBoolean)
    }
}

const checkFill = (data, path) => {
    return {
        option: checkValue(data, [...path, 'option'], 'none', isEnum("foreground", "background", "none", "custom", "tween")),
        color: checkValue(data, [...path, 'color'], '#000', isColor)
    }
}

const checkPolygonRadius = (data, path, valueFB, unitFB, scaleFB, ...funcs) => {
    return {
        value: checkValue(data, [...path, "value"], valueFB, ...funcs),
        unit: checkValue(data, [...path, "unit"], unitFB, isEnum(1, 96, 2.54, 25.4)),
        useScale: checkValue(data, [...path, "useScale"], scaleFB, isBoolean)
    }
}

const checkLength = (data, path, valueFB, unitFB, useScale, useScribe, ...funcs) => {
    return {
        value: checkValue(data, [...path, "value"], valueFB, ...funcs),
        unit: checkValue(data, [...path, "unit"], unitFB, isEnum(1, 96, 2.54, 25.4))
    }
}

const checkLengthWithScale = (data, path, valueFB, unitFB, scaleFB, ...funcs) => {
    return {
        value: checkValue(data, [...path, "value"], valueFB, ...funcs),
        unit: checkValue(data, [...path, "unit"], unitFB, isEnum(1, 96, 2.54, 25.4)),
        useScale: checkValue(data, [...path, "useScale"], scaleFB, isBoolean)
    }
}

const checkLayers = (data, path) => {
    return checkValue(data, path, [], isArray).map((each, i) => {
        const t = checkValue(each, ["type"], null, isEnum(...Object.keys(LAYERS)))
        if (t === null) { return undefined }
        return LAYERS[t].validate(data, [...path, i])
    }).filter(a => a !== undefined)
}

const checkEffect = (data, path) => {
    const t = checkValue(data, [...path, 'type'], null, isEnum(...Object.keys(EFFECTS)));
    if (t === null) { return null; }
    return EFFECTS[t].validate(data, path);
}

export const validateUpload = (data) => {
    const path = [];
    const result = {};
    result.name = checkValue(data, [...path, "name"], "", isString);
    result.colors = {
        foreground: checkValue(data, [...path, "colors", "foreground"], "#800", isColor),
        background: checkValue(data, [...path, "colors", "background"], "#fff", isLiteral("none"), isColor),
        canvas: checkValue(data, [...path, "colors", "canvas"], "#fff", isColor),
        viewport: checkValue(data, [...path, "colors", "viewport"], "#000", isColor)
    }
    result.dimensions = {
        w: checkLength(data, [...path, "dimensions", "w"], 5, 96, isGT(0)),
        h: checkLength(data, [...path, "dimensions", "h"], 5, 96, isGT(0))
    }
    result.layers = checkLayers(data, [...path, "layers"])
    return result;
}

const output = {
    validateUpload,
    LAYERS,
    EFFECTS
};
export default output;
