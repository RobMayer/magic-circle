import interpolation from './interpolation';

const CURVES = Object.keys(interpolation.CURVE_NAMES);

const collapse = (verts, segments) => {
    const res = [];
    for (let i = 0; i < verts.length; i++) {
        res.push(verts[i]);
        if (i < segments.length) {
            res.push(segments[i]);
        }
    }
    return res;
}

class Spline {
    #verts;
    #segments;

    static fromString(str) {
        if (typeof str !== 'string') { return null; }
        const items = str.split(",").map(e => e.trim());
        let lm = "segment";
        const test = items.reduce((acc, each, i) => {
            if (each === "" && lm === "vert") {
                acc.segments.push("linear");
                lm = "segment";
                return acc;
            }
            if (CURVES.includes(each.toLowerCase())) {
                if (lm === "segment") {
                    return acc;
                }
                acc.segments.push(CURVES.includes(each?.toLowerCase()) ? each?.toLowerCase() : "linear");
                lm = "segment";
            } else {
                const [value, position] = each.split(" ");
                if (lm === "vert") {
                    acc.segments.push("linear");
                }
                const v = Number(value);
                const t = Number(position);
                lm = "vert";
                if (isNaN(v)) { return acc; }
                acc.verts.push({ value: v, position: !isNaN(t) ? t : undefined })
            }
            return acc;
        }, { verts: [], segments: [] })
        if (test.verts.length === 1) {
            test.verts[0].position = 0;
            return new Spline(test.verts[0]);
        } else {
            test.verts[0].position = test.verts[0].position ?? 0;
            test.verts[test.verts.length - 1].position = test.verts[test.verts.length - 1].position ?? 1;
        }
        for (let i = 1; i < test.verts.length - 1; i++) {
            if (test.verts[i].position === undefined) {
                const prevAry = test.verts.slice(0, i).reverse();
                const nextAry = test.verts.slice(i+1);
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
                test.verts[i].position = interpolation.lerp(interpolation.delerp(i, pIdx - 1, nIdx + 1), pPos, nPos);
            }
        }
        return new Spline(...collapse(test.verts, test.segments));
    }

    constructor (...stops) {
        let m = 0;
        const { verts, segments } = stops.reduce((acc, each, i) => {
            if (i % 2 === 1) {
                acc.segments.push(CURVES.includes(each) ? each : "linear");
            } else {
                const position = Math.min(1, Math.max(m, each?.position ?? m, 0));
                const value = each?.value ?? 1.0;
                m = position;
                acc.verts.push({ value, position });
            }
            return acc;
        }, { verts: [], segments: [] })
        this.#verts = verts;
        this.#segments = segments;
    }

    getValueAt = (v) => {
        if (v <= 0) { return this.#verts[0].value; }
        if (v >= 1) { return this.#verts[this.#verts.length - 1].value; }
        if (this.#verts.length === 1) { return this.#verts[0].value; }
        const si = this.#verts.reduce((acc, { position }, i) => {
            if (acc !== null) { return acc; }
            if (v <= position) { return i; }
            return null;
        }, null);
        if (si === null) {
            return this.#verts[this.#verts.length - 1].value;
        } else if (si === 0) {
            return this.#verts[0].value;
        } else {
            const start = this.#verts[si - 1];
            const end = this.#verts[si];
            const seg = this.#segments[si - 1];
            return interpolation.lerp(interpolation.delerp(v, start.position, end.position), start.value, end.value, seg);
        }
    }

    removeBy = (index) => {
        if (index < 0 || index > this.#verts.length - 1) {
            return this;
        }
        if (index === 0) {
            this.#verts.shift();
            this.#segments.shift();
        } else if (index === this.#verts.length - 1) {
            this.#verts.pop();
            this.#segments.pop();
        } else {
            /// here's where it gets good....
            const c = [...this.#verts];
            const s = [...this.#segments];
            const nS = s[index - 1] === s[index] ? s[index] : "linear";
            this.#verts = [...c.slice(0, index), ...c.slice(index + 1)];
            this.#segments = [...s.slice(0, index - 1), nS, ...s.slice(index + 1)];
        }
        return this;
    }

    insertAt = (position, value = null, segmentLeft = null, segmentRight = null) => {
        position = Math.round(position * 1000) / 1000;
        if (value === null) {
            value = this.getValueAt(position);
        } else {
            value = Number(value);
            if (isNaN(value)) {
                value = this.getValueAt(position);
            }
        }
        value = Math.round(value * 1000) / 1000;
        segmentLeft = segmentLeft ?? this.getSegmentAt(position) ?? "linear";
        segmentRight = segmentRight ?? this.getSegmentAt(position) ?? "linear";
        const [after, before] = this.getIndicesAt(position);
        if (after === null) {
            this.#verts.unshift( { value, position } );
            this.#segments.unshift(segmentRight);
            return 0;
        } else if (before === null) {
            this.#verts.push( { value, position } );
            this.#segments.push( segmentLeft );
            return this.#verts.length - 1;
        } else {
            this.#verts.splice(before, 0, { value, position });
            const cur = [...this.#segments];
            this.#segments = [...cur.slice(0, after), segmentLeft, segmentRight, ...cur.slice(before) ];
            return after + 1;
        }
    }

    getMaxValue = () => {
        return this.#verts.reduce((acc, each) => {
            return Math.max(each.value, acc);
        }, 1)
    }

    getSegmentAt = (v) => {
        if (v <= 0) { return null; }
        if (v >= 1) { return null; }
        if (this.#verts.length === 1) { return null; }
        if (v < this.#verts[0].position) { return null; }
        if (v > this.#verts[this.#verts.length - 1].position) { return null; }
        const si = this.#verts.reduce((acc, { position }, i) => {
            if (acc !== null) { return acc; }
            if (v <= position) { return i; }
            return null;
        }, null);
        if (si === null) {
            return null;
        } else {
            return this.#segments[si - 1];
        }
    }

    getIndicesAt = (v) => {
        if (this.#verts.length === 1) { return [0, 1] }
        if (v < 0) { return [null, 0]; }
        if (v > 1) { return [this.#verts.length - 1, null]; }
        if (v < this.#verts[0].position) { return [null, 0] }
        if (v > this.#verts[this.#verts.length - 1].position) { return [this.#verts.length - 1, null] }
        const si = this.#verts.reduce((acc, { position }, i) => {
            if (acc !== null) { return acc; }
            if (v <= position) { return i; }
            return null;
        }, null);
        if (si === null) {
            return [this.#verts.length - 1, this.#verts.length];
        } else if (si === 0) {
            return [0, 1];
        } else {
            return [si - 1, si];
        }
    }

    getVertBy = (i) => {
        return this.#verts?.[i] ?? null;
    }

    getLength = () => {
        return this.#verts.length;
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

    getVerts = () => {
        return [...this.#verts];
    }

    getSegments = () => {
        return [...this.#segments];
    }

    setVertValue = (i, value) => {
        value = Number(value);
        if (isNaN(value)) { return this; }
        if (i < this.#verts.length && i >= 0) {
            this.#verts[i] = { ...(this.#verts?.[i] ?? {}), value };
        }
        return this;
    }

    setVertPosition = (i, position) => {
        if (i < this.#verts.length && i >= 0) {
            position = Math.max(0, Math.min(1, position));
            this.#verts[i] = { ...(this.#verts?.[i] ?? {}), position };
        }
        return this;
    }

    setSegment = (i, curve) => {
        if (i < this.#segments.length && i >= 0 && CURVES.includes(curve)) {
            this.#segments[i] = curve;
        }
        return this;
    }

    getSegmentLimits = (i) => {
        if (i >= 0 && i < this.#segments.length) {
            return {
                left: this.#verts[i].position,
                right: this.#verts[i + 1].position
            }
        }
        return { left: 0, right: 1 }
    }

    getVertLimits = (i) => {
        if (this.#verts.length === 1) { return { min: 0, max: 1 } }
        if (i === 0) { return { min: 0, max: this.#verts[i + 1].position }}
        if (i === this.#verts.length - 1) { return { min: this.#verts[i - 1].position, max: 1 }}
        return {
            min: this.#verts[i - 1].position,
            max: this.#verts[i + 1].position
        }
    }

    getVertValue = (i) => { return this.#verts?.[i]?.value ?? null; }
    getVertPosition = (i) => { return this.#verts?.[i]?.position ?? null; }

    getSegment = (i) => { return this.#segments?.[i] ?? null; }

    toString = () => {
        const res = [];
        for (let i = 0; i < this.#verts.length; i++) {
            res.push(`${this.#verts[i].value} ${this.#verts[i].position}`)
            if (i < this.#segments.length) {
                res.push(this.#segments[i])
            }
        }
        return res.join(",");
    }

    toSvg = (step = 0.125) => {
        let d = "";
        const max = this.getMaxValue();
        if (this.#verts[0].position === 0) {
            d += `M ${this.#verts[0].position},${1 - (this.#verts[0].value / max)} `;
        } else {
            d += `M 0,${1 - (this.#verts[0].value / max)} L ${this.#verts[0].position},${1 - (this.#verts[0].value / max)} `
        }
        let c = [this.#verts[0].position, this.#verts[0].value / max];
        if (this.#verts.length > 1) {
            for (let i = 1; i < this.#verts.length; i++) {
                const p = [c[0], c[1]];
                const curve = this.#segments[i - 1];
                const t = [this.#verts[i].position, this.#verts[i].value / max];
                d += `L ${c[0]},${1 - c[1]} `;
                for (let f = step; f < 1; f += step) {
                    const x = interpolation.lerp(f, p[0], t[0]);
                    const y = interpolation.lerp(f, p[1], t[1], curve);
                    d += `L ${x},${1 - y} `;
                }
                d += `L ${t[0]},${1 - t[1]}`;
                c = [t[0], t[1]];
            }
        }
        d += `L ${1},${1 - (this.#verts[this.#verts.length - 1].value / max)}`;
        return d;
    }
}


export default Spline;
