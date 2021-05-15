const generateCurves = (name, func) => {
    return {
        [`${name}_in`] : a => func(a),
        [`${name}_out`] : a => 1 - func(1 - a),
        [`${name}_inout`] : a => a < 0.5 ? func(a * 2) / 2 : a > 0.5 ? 1 - func(a * -2 + 2) / 2 : 0.5,
        [`${name}_outin`] : a => a < 0.5 ? 0.5 - func(1 - a * 2) / 2 : a > 0.5 ? 0.5 + func(a * 2 - 1) / 2 : 0.5
    }
}

export const curves = {
    linear: a => a,
    ...generateCurves("quadratic", a => Math.pow(a, 2)),
    ...generateCurves("cubic", a => Math.pow(a, 3)),
    ...generateCurves("semiquadratic", a => Math.pow(a, 1.5)),
    ...generateCurves("exponential", a => Math.pow(2, a) - 1),
    ...generateCurves("sinic", a => Math.sin(a * (Math.PI / 2))),
    ...generateCurves("cosinic", a => -1 * Math.cos(a * (Math.PI / 2)) + 1),
    ...generateCurves("rootic", a => Math.sqrt(a))
}

export const lerp = (t, a, b, curve = "linear") => {
    if (!(curve in curves)) { curve = "linear"; }
    t = curves[curve](t);
    return a + t * (b - a);
}

export const delerp = (d, start, end) => {
    return (end - start) === 0 ? 0 : (d - start) / (end - start);
}

const output = {
    lerp,
    delerp,
    curves
}
export default output;
