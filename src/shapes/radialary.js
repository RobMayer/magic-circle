import Shape from './';
import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { LayerWrapper, onChange, onValue } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Checkbox from '../ui/checkbox';
import Tabs from '../ui/tabs';
import { range } from 'lodash';
import NumberInput from '../ui/numberinput';
import ColorInput from '../ui/colorinput';
import Field from '../ui/field';
import Dropdown from '../ui/dropdown';
import LayerList from './layerlist';
import Interpolation from '../util/interpolation';

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radialMode, inner, outer, radius, spread, thetaMode, count, step, coverage, skipLast, layers, scaleCurve, radialCurve, thetaCurve, scaleFactor, tweenScale, visible, renderAsMask, colors,
    colorFactorStroke, colorSpaceStroke, colorCurveStroke,
    colorFactorFill, colorSpaceFill, colorCurveFill
}) => {
    // thetaMode determines how objects are thrown around the circumference
    // radialMode determines the inner and outer radius of
    if (!visible) { return null }
    if (count <= 0 || layers.length <= 0) {
        return null;
    }

    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const rO = radialMode === "innerouter" ? (outer.value * outer.unit * (outer.useScale ? (tweenScale ?? 1) : 1)) : (radius.value * radius.unit * (radius.useScale ? (tweenScale ?? 1) : 1) + (spread.value * spread.unit * (spread.useScale ? (tweenScale ?? 1) : 1)) / 2);
    const rI = radialMode === "innerouter" ? (inner.value * inner.unit * (inner.useScale ? (tweenScale ?? 1) : 1)) : (radius.value * radius.unit * (radius.useScale ? (tweenScale ?? 1) : 1) - (spread.value * spread.unit * (spread.useScale ? (tweenScale ?? 1) : 1)) / 2);

    const skipit = thetaMode === "startstop" && skipLast;

    const children = range(skipit ? count - 1 : count).map((n) => {
        const cA = Interpolation.delerp(n, 0, count - 1);
        const coeff = Interpolation.delerp(n, 0, count - (skipit ? 2 : 1));
        const angle = thetaMode === "startstop" ? Interpolation.lerp(cA, 1 * coverage.start, 1 * coverage.end, thetaCurve) : step * n;
        const s = Interpolation.lerp(coeff, 1 * scaleFactor.start, 1 * scaleFactor.end, scaleCurve);
        const c = {
            stroke: colorFactorStroke?.start && colorFactorStroke?.end ? "#" + Interpolation.colorlerp(Interpolation.delerp(n, 0, count), colorFactorStroke.start, colorFactorStroke.end, colorSpaceStroke, colorCurveStroke) : null,
            fill: colorFactorFill?.start && colorFactorFill?.end ? "#" + Interpolation.colorlerp(Interpolation.delerp(n, 0, count), colorFactorFill.start, colorFactorFill.end, colorSpaceFill, colorCurveFill) : null
        }
        const rad = Interpolation.lerp(coeff, rI, rO, radialCurve);
        const nested = layers.map((layer, i) => {
            return <Shape.Drawing key={i} {...layer} path={[...path, 'layers', i]} tweenScale={s} tweenColors={c} renderAsMask={renderAsMask} colors={colors} />
        });
        return <g key={n} style={{ transform: `rotate(${angle}deg) translate(0px, ${rad}px)`}}>{nested}</g>
    })
    return <g style={{ transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`}}>{children}</g>
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <LayerWrapper layer={layer} path={path} name='Radial Array' withVisibility>
        <Field label={"Count"}>
            <NumberInput value={layer.count} onChange={onChange(dispatch, [...path, 'count'])} min={0} />
        </Field>
        <Tabs value={layer.radialMode} onChange={onValue(dispatch, [...path, 'radialMode'])}>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
            <Prefabs.Length label={"Radius"} value={layer.radius} dispatch={dispatch} path={[...path, 'radius']} withScale />
            <Prefabs.Length label={"Spread"} value={layer.spread} dispatch={dispatch} path={[...path, 'spread']} withScale />
            <Field label={"Distribution"}>
                <Dropdown value={layer.radialCurve} onChange={onChange(dispatch, [...path, 'radialCurve'])}>
                    {Object.keys(Interpolation.curves).map((curve) => {
                        return <option key={curve} value={curve}>{curve}</option>
                    })}
                </Dropdown>
            </Field>
            </Tabs.Option>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Length label={"Radius (Inner)"} value={layer.inner} dispatch={dispatch} path={[...path, 'inner']} withScale />
                <Prefabs.Length label={"Radius (Outer)"} value={layer.outer} dispatch={dispatch} path={[...path, 'outer']} withScale />
                <Field label={"Distribution"}>
                    <Dropdown value={layer.radialCurve} onChange={onChange(dispatch, [...path, 'radialCurve'])}>
                        {Object.keys(Interpolation.curves).map((curve) => {
                            return <option key={curve} value={curve}>{curve}</option>
                        })}
                    </Dropdown>
                </Field>
            </Tabs.Option>
        </Tabs>
        <Tabs value={layer.thetaMode} onChange={onValue(dispatch, [...path, 'thetaMode'])}>
            <Tabs.Option value={"incremental"} label={"Incremental Steps"}>
                <Field label={"θ Increment"} tooltip={"Incremental Angle"}>
                    <NumberInput value={layer.step} onChange={onChange(dispatch, [...path, 'step'])} />
                </Field>
            </Tabs.Option>
            <Tabs.Option value={"startstop"} label={"Divided Coverage"}>
                <Field label={"Start θ"} tooltip={"Start Angle"}>
                    <NumberInput value={layer.coverage.start} onChange={onChange(dispatch, [...path, 'coverage', 'start'])} />
                </Field>
                <Field label={"End θ"} tooltip={"End Angle"}>
                    <NumberInput value={layer.coverage.end} onChange={onChange(dispatch, [...path, 'coverage', 'end'])} />
                </Field>
                <Field label={"Skip Last"} tooltip={"Does not render last node"} inlineLabel>
                    <Checkbox value={layer.skipLast} onChange={onValue(dispatch, [...path, 'skipLast'])} />
                </Field>
                <Field label={"Distribution"}>
                    <Dropdown value={layer.thetaCurve} onChange={onChange(dispatch, [...path, 'thetaCurve'])}>
                        {Object.keys(Interpolation.curves).map((curve) => {
                            return <option key={curve} value={curve}>{curve}</option>
                        })}
                    </Dropdown>
                </Field>
            </Tabs.Option>
        </Tabs>
        <Field.Group label={"Interpolation"}>
            <Field.Row label={"Scale"}>
                <Field label={"Start"}><NumberInput value={layer.scaleFactor.start} onChange={onChange(dispatch, [...path, 'scaleFactor', 'start'])} step={0.001} min={0} /></Field>
                <Field label={"End"}><NumberInput value={layer.scaleFactor.end} onChange={onChange(dispatch, [...path, 'scaleFactor', 'end'])} step={0.001} min={0} /></Field>
                <Field label={"Distribution"}>
                    <Dropdown value={layer.scaleCurve} onChange={onChange(dispatch, [...path, 'scaleCurve'])}>
                        {Object.keys(Interpolation.curves).map((curve) => {
                            return <option key={curve} value={curve}>{curve}</option>
                        })}
                    </Dropdown>
                </Field>
            </Field.Row>
            <Field.Row label={"Stroke"}>
                <Field label={"Start"}><ColorInput value={layer.colorFactorStroke.start} onChange={onChange(dispatch, [...path, 'colorFactorStroke', 'start'])} /></Field>
                <Field label={"End"}><ColorInput value={layer.colorFactorStroke.end} onChange={onChange(dispatch, [...path, 'colorFactorStroke', 'end'])} /></Field>
            </Field.Row>
            <Field.Row label={""}>
                <Field label={"ColorSpace"}>
                    <Dropdown value={layer.colorSpaceStroke} onChange={onChange(dispatch, [...path, 'colorSpaceStroke'])}>
                        {Object.entries(Interpolation.COLORSPACE_NAMES).map(([k, v]) => {
                            return <option key={k} value={k}>{v}</option>
                        })}
                    </Dropdown>
                </Field>
                <Field label={"Distribution"}>
                    <Dropdown value={layer.colorCurveStroke} onChange={onChange(dispatch, [...path, 'colorCurveStroke'])}>
                        {Object.keys(Interpolation.curves).map((curve) => {
                            return <option key={curve} value={curve}>{curve}</option>
                        })}
                    </Dropdown>
                </Field>
            </Field.Row>
            <Field.Row label={"Fill"}>
                <Field label={"Start"}><ColorInput value={layer.colorFactorFill.start} onChange={onChange(dispatch, [...path, 'colorFactorFill', 'start'])} /></Field>
                <Field label={"End"}><ColorInput value={layer.colorFactorFill.end} onChange={onChange(dispatch, [...path, 'colorFactorFill', 'end'])} /></Field>
            </Field.Row>
            <Field.Row>
                <Field label={"ColorSpace"}>
                    <Dropdown value={layer.colorSpaceFill} onChange={onChange(dispatch, [...path, 'colorSpaceFill'])}>
                        {Object.entries(Interpolation.COLORSPACE_NAMES).map(([k, v]) => {
                            return <option key={k} value={k}>{v}</option>
                        })}
                    </Dropdown>
                </Field>
                <Field label={"Distribution"}>
                    <Dropdown value={layer.colorCurveFill} onChange={onChange(dispatch, [...path, 'colorCurveFill'])}>
                        {Object.keys(Interpolation.curves).map((curve) => {
                            return <option key={curve} value={curve}>{curve}</option>
                        })}
                    </Dropdown>
                </Field>
            </Field.Row>
        </Field.Group>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Field.Heading>Sub Layers</Field.Heading>
        <LayerList.Interface path={[...path, 'layers']} layers={layer.layers} fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
