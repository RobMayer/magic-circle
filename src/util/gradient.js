import interpolation from './interpolation';

const COLOR_REGEX = /#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})/;
const COLOR_REGEX_COMPLETE = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

const CURVES = Object.keys(interpolation.CURVE_NAMES);
const COLORSPACES = Object.keys(interpolation.COLORSPACE_NAMES);

const collapse = (colors, segments) => {
    const res = [];
    for (let i = 0; i < colors.length; i++) {
        res.push(colors[i]);
        if (i < segments.length) {
            res.push(segments[i]);
        }
    }
    return res;
}

class Gradient {
    #colors;
    #segments;

    static fromString(str) {
        if (typeof str !== 'string') { return null; }
        const items = str.split(",").map(e => e.trim());
        let lm = "segment";
        const test = items.reduce((acc, each, i) => {
            if (each === "" && lm === "color") {
                acc.segments.push({ curve: "linear", space: "rgb" });
                lm = "segment";
                return acc;
            }
            if (COLOR_REGEX.test(each)) {
                const [value, position] = each.split(" ");
                if (lm === "color") {
                    acc.segments.push({ curve: "linear", space: "rgb" });
                }
                const t = Number(position);
                lm = "color";
                acc.colors.push({ value, position: !isNaN(t) ? t : undefined })
            } else {
                if (lm === "segment") {
                    return acc;
                }
                const [a = "", b = ""] = each.split(" ");
                let space = "rgb";
                let curve = "linear";
                if (CURVES.includes(a.toLowerCase())) { curve = a.toLowerCase() }
                if (CURVES.includes(b.toLowerCase())) { curve = b.toLowerCase() }
                if (COLORSPACES.includes(a.toLowerCase())) { space = a.toLowerCase() }
                if (COLORSPACES.includes(b.toLowerCase())) { space = b.toLowerCase() }
                acc.segments.push({ space, curve });
                lm = "segment";
            }
            return acc;
        }, { colors: [], segments: [] })
        if (test.colors.length === 1) {
            test.colors[0].position = 0;
            return new Gradient(test.colors[0]);
        } else {
            test.colors[0].position = test.colors[0].position ?? 0;
            test.colors[test.colors.length - 1].position = test.colors[test.colors.length - 1].position ?? 1;
        }
        for (let i = 1; i < test.colors.length - 1; i++) {
            if (test.colors[i].position === undefined) {
                const prevAry = test.colors.slice(0, i).reverse();
                const nextAry = test.colors.slice(i+1);
                const [ pPos, pIdx ] = prevAry.reduce((acc, each, j) => {
                    if (acc !== null) { return acc }
                    if (each.position !== undefined) {
                        return [each.position, i - j]
                    }
                    return null;
                }, null)
                const [ nPos, nIdx ] = nextAry.reduce((acc, each, j) => {
                    if (acc !== null) { return acc }
                    if (each.position !== undefined) {
                        return [each.position, i + j]
                    }
                    return null;
                }, null)
                test.colors[i].position = interpolation.lerp(interpolation.delerp(i, pIdx - 1, nIdx + 1), pPos, nPos);
            }
        }
        return new Gradient(...collapse(test.colors, test.segments));
    }

    constructor (...stops) {
        let m = 0;
        const { colors, segments } = stops.reduce((acc, each, i) => {
            if (i % 2 === 1) {
                const space = Object.keys(interpolation.COLORSPACE_NAMES).includes(each?.space) ? each?.space : "rgb";
                const curve = Object.keys(interpolation.CURVES).includes(each?.curve) ? each?.curve : "linear";
                acc.segments.push({ space, curve });
            } else {
                const position = Math.min(1, Math.max(m, each?.position ?? m, 0));
                const value = each?.value ?? "#fff";
                m = position;
                acc.colors.push({ value, position });
            }
            return acc;
        }, { colors: [], segments: [] })
        this.#colors = colors;
        this.#segments = segments;
    }

    getColorAt = (v) => {
        if (v <= 0) { return this.#colors[0].value; }
        if (v >= 1) { return this.#colors[this.#colors.length - 1].value; }
        if (this.#colors.length === 1) { return this.#colors[0].value; }
        const si = this.#colors.reduce((acc, { position }, i) => {
            if (acc !== null) { return acc; }
            if (v <= position) { return i; }
            return null;
        }, null);
        if (si === null) {
            return this.#colors[this.#colors.length - 1].value;
        } else if (si === 0) {
            return this.#colors[0].value;
        } else {
            const start = this.#colors[si - 1];
            const end = this.#colors[si];
            const seg = this.#segments[si - 1];
            return "#" + interpolation.colorlerp(interpolation.delerp(v, start.position, end.position), start.value, end.value, seg.space, seg.curve);
        }
    }

    removeBy = (index) => {
        if (index < 0 || index > this.#colors.length - 1) {
            return this;
        }
        if (index === 0) {
            this.#colors.shift();
            this.#segments.shift();
        } else if (index === this.#colors.length - 1) {
            this.#colors.pop();
            this.#segments.pop();
        } else {
            /// here's where it gets good....
            const c = [...this.#colors];
            const s = [...this.#segments];
            const nS = {
                curve: s[index - 1].curve === s[index].curve ? s[index].curve : "linear",
                space: s[index - 1].space === s[index].space ? s[index].space : "rgb",
            }
            this.#colors = [...c.slice(0, index), ...c.slice(index + 1)];
            this.#segments = [...s.slice(0, index - 1), nS, ...s.slice(index + 1)];
        }
        return this;
    }

    insertAt = (position, value = null, segmentLeft = null, segmentRight = null) => {
        position = Math.round(position * 1000) / 1000;
        value = value ?? this.getColorAt(position);
        segmentLeft = segmentLeft ?? this.getSegmentAt(position) ?? { curve: "linear", space: "rgb" };
        segmentRight = segmentRight ?? this.getSegmentAt(position) ?? { curve: "linear", space: "rgb" };
        const [after, before] = this.getIndicesAt(position);
        if (before === 0) {
            this.#colors.unshift( { value, position } );
            this.#segments.unshift( { space: segmentRight.space, curve: segmentRight.curve } );
            return 0;
        } else if (after === this.#colors.length) {
            this.#colors.push( { value, position } );
            this.#segments.push( { space: segmentLeft.space, curve: segmentLeft.curve } );
            return this.#colors.length;
        } else {
            this.#colors.splice(before, 0, { value, position });
            const cur = [...this.#segments];
            this.#segments = [...cur.slice(0, after), { space: segmentLeft.space, curve: segmentLeft.curve }, { space: segmentRight.space, curve: segmentRight.curve }, ...cur.slice(before) ];
            return after + 1;
        }
    }

    getSegmentAt = (v) => {
        if (v <= 0) { return null; }
        if (v >= 1) { return null; }
        if (this.#colors.length === 1) { return null; }
        if (v < this.#colors[0].position) { return null; }
        if (v > this.#colors[this.#colors.length - 1].position) { return null; }
        const si = this.#colors.reduce((acc, { position }, i) => {
            if (acc !== null) { return acc; }
            if (v <= position) { return i; }
            return null;
        }, null);
        if (si === null) {
            return null;
        } else {
            const { curve, space } = this.#segments[si - 1];
            return { curve, space }
        }
    }

    getIndicesAt = (v) => {
        if (this.#colors.length === 1) { return [0, 1] }
        if (v <= 0) { return [0, 1]; }
        if (v >= 1) { return [this.#colors.length - 1, this.#colors.length]; }
        const si = this.#colors.reduce((acc, { position }, i) => {
            if (acc !== null) { return acc; }
            if (v <= position) { return i; }
            return null;
        }, null);
        if (si === null) {
            return [this.#colors.length - 1, this.#colors.length];
        } else if (si === 0) {
            return [0, 1];
        } else {
            return [si - 1, si];
        }
    }

    getColorBy = (i) => {
        return this.#colors?.[i] ?? null;
    }

    getLength = () => {
        return this.#colors.length;
    }

    getSegmentBy = (i) => {
        return this.#segments?.[i] ?? null;
    }

    getSegmentsAround = (i) => {
        return {
            left: this.#segments?.[i - 1] ?? null,
            right: this.#segments?.[i] ?? null
        }
    }

    getColors = () => {
        return [...this.#colors];
    }

    getSegments = () => {
        return [...this.#segments];
    }

    setColorValue = (i, value) => {
        if (i < this.#colors.length && i >= 0 && COLOR_REGEX_COMPLETE.test(value)) {
            this.#colors[i] = { ...(this.#colors?.[i] ?? {}), value };
        }
        return this;
    }

    setColorPosition = (i, position) => {
        if (i < this.#colors.length && i >= 0) {
            position = Math.max(0, Math.min(1, position));
            this.#colors[i] = { ...(this.#colors?.[i] ?? {}), position };
        }
        return this;
    }

    setSegmentCurve = (i, curve) => {
        console.log(curve);
        if (i < this.#segments.length && i >= 0 && CURVES.includes(curve)) {
            this.#segments[i] = { ...(this.#segments?.[i] ?? {}), curve };
        }
        return this;
    }

    setSegmentSpace = (i, space) => {
        if (i < this.#segments.length && i >= 0 && COLORSPACES.includes(space)) {
            this.#segments[i] = { ...(this.#segments?.[i] ?? {}), space };
        }
        return this;
    }

    getSegmentLimits = (i) => {
        if (i >= 0 && i < this.#segments.length) {
            return {
                left: this.#colors[i].position,
                right: this.#colors[i + 1].position
            }
        }
        return { left: 0, right: 1 }
    }

    getColorLimits = (i) => {
        if (this.#colors.length === 1) { return { min: 0, max: 1 } }
        if (i === 0) { return { min: 0, max: this.#colors[i + 1].position }}
        if (i === this.#colors.length - 1) { return { min: this.#colors[i - 1].position, max: 1 }}
        return {
            min: this.#colors[i - 1].position,
            max: this.#colors[i + 1].position
        }
    }

    getColorValue = (i) => { return this.#colors?.[i]?.value ?? null; }
    getColorPosition = (i) => { return this.#colors?.[i]?.position ?? null; }

    getSegmentCurve = (i) => { return this.#segments?.[i]?.curve ?? null; }
    getSegmentSpace = (i) => { return this.#segments?.[i]?.space ?? null; }

    toString = () => {
        const res = [];
        for (let i = 0; i < this.#colors.length; i++) {
            res.push(`${this.#colors[i].value} ${this.#colors[i].position}`)
            if (i < this.#segments.length) {
                res.push(`${this.#segments[i].space} ${this.#segments[i].curve}`)
            }
        }
        return res.join(",");
    }
}


export default Gradient;
