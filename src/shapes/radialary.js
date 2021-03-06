import Shape from './';
import { LayerWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Checkbox from '../ui/checkbox';
import Tabs from '../ui/tabs';
import { range } from 'lodash';
import NumberInput from '../ui/numberinput';
import Field from '../ui/field';
import Dropdown from '../ui/dropdown';
import LayerList from './layerlist';
import GradientInput from '../ui/gradientinput';
import SplineInput from '../ui/splineinput';
import Interpolation from '../util/interpolation';
import Gradient from '../util/gradient';
import Spline from '../util/spline';

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radialMode, inner, outer, radius, spread, thetaMode, count, step, coverage, toExtent, layers, scaleCurve, radialCurve, thetaCurve, scaleFactor, tweenScale, tweenColors, visible, renderAsMask, colors,
    colorFactorInherit, colorFactorFill, colorFactorStroke
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

    const doOverlap = thetaMode === "startstop" && !toExtent;

    const children = range(count).map((n) => {
        const coeff = Interpolation.delerp(n, 0, count - 1);
        const cA = Interpolation.delerp(n, 0, doOverlap ? count : count - 1);
        const angle = thetaMode === "startstop" ? Interpolation.lerp(cA, 1 * coverage.start, 1 * coverage.end, thetaCurve) : step * n;
        const s = Spline.fromString(scaleFactor).getValueAt(cA);
        const c = {
            stroke: Gradient.fromString(colorFactorStroke).getColorAt(cA),
            fill: Gradient.fromString(colorFactorFill).getColorAt(cA)
        }
        const rad = Interpolation.lerp(coeff, rI, rO, radialCurve);
        const nested = layers.map((layer, i) => {
            return <Shape.Drawing key={i} {...layer} path={[...path, 'layers', i]} tweenScale={s} tweenColors={colorFactorInherit ? (tweenColors ?? c) : c} renderAsMask={renderAsMask} colors={colors} />
        });
        return <g key={n} style={{ transform: `rotate(${angle - 180}deg) translate(0px, ${rad}px)`}}>{nested}</g>
    })
    return <g style={{ transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`}}>{children}</g>
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Radial Array' withVisibility>
        <Field label={"Count"}>
            <NumberInput value={layer.count} onDispatch={[...path, 'count']} min={0} />
        </Field>
        <Tabs value={layer.radialMode} onDispatch={[...path, 'radialMode']}>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Length label={"Radius (Inner)"} value={layer.inner} path={[...path, 'inner']} withScale />
                <Prefabs.Length label={"Radius (Outer)"} value={layer.outer} path={[...path, 'outer']} withScale />
                <Field label={"Distribution"}>
                    <Dropdown value={layer.radialCurve} onDispatch={[...path, 'radialCurve']}>
                        {Object.entries(Interpolation.CURVE_NAMES).map(([k, v]) => {
                            return <option key={k} value={k}>{v}</option>
                        })}
                    </Dropdown>
                </Field>
            </Tabs.Option>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
                <Prefabs.Length label={"Radius"} value={layer.radius} path={[...path, 'radius']} withScale />
                <Prefabs.Length label={"Spread"} value={layer.spread} path={[...path, 'spread']} withScale />
                <Field label={"Distribution"}>
                    <Dropdown value={layer.radialCurve} onDispatch={[...path, 'radialCurve']}>
                        {Object.entries(Interpolation.CURVE_NAMES).map(([k, v]) => {
                            return <option key={k} value={k}>{v}</option>
                        })}
                    </Dropdown>
                </Field>
            </Tabs.Option>
        </Tabs>
        <Tabs value={layer.thetaMode} onDispatch={[...path, 'thetaMode']}>
            <Tabs.Option value={"incremental"} label={"Incremental Steps"}>
                <Field label={"?? Increment"} tooltip={"Incremental Angle"}>
                    <NumberInput value={layer.step} onDispatch={[...path, 'step']} />
                </Field>
            </Tabs.Option>
            <Tabs.Option value={"startstop"} label={"Divided Coverage"}>
                <Field label={"Start ??"} tooltip={"Start Angle"}>
                    <NumberInput value={layer.coverage.start} onDispatch={[...path, 'coverage', 'start']} />
                </Field>
                <Field label={"End ??"} tooltip={"End Angle"}>
                    <NumberInput value={layer.coverage.end} onDispatch={[...path, 'coverage', 'end']} />
                </Field>
                <Field>
                    <Checkbox value={layer.toExtent} onDispatch={[...path, 'toExtent']} label={"To Extent"} tooltip={"Pushes the last item to full coverage"} />
                </Field>
                <Field label={"Distribution"}>
                    <Dropdown value={layer.thetaCurve} onDispatch={[...path, 'thetaCurve']}>
                        {Object.entries(Interpolation.CURVE_NAMES).map(([k, v]) => {
                            return <option key={k} value={k}>{v}</option>
                        })}
                    </Dropdown>
                </Field>
            </Tabs.Option>
        </Tabs>
        <Field.Group label={"Sub-Layer Interpolation"}>
            <Field label={"Scale"}>
                <SplineInput value={layer.scaleFactor} onDispatch={[...path, 'scaleFactor']} />
            </Field>
            <Field label={"Stroke"} columns={"1fr min-content"}>
                <GradientInput value={layer.colorFactorStroke} onDispatch={[...path, 'colorFactorStroke']} />
            </Field>
            <Field label={"Fill"} columns={"1fr min-content"}>
                <GradientInput value={layer.colorFactorFill} onDispatch={[...path, 'colorFactorFill']} />
            </Field>
            <Field>
                <Checkbox value={layer.colorFactorInherit} onDispatch={[...path, 'colorFactorInherit']} label={"Inherit Color Interpolation from Parent"} />
            </Field>
        </Field.Group>
        <Prefabs.Transforms layer={layer} path={path} withRotation />
        <Field.Heading>Sub Layers</Field.Heading>
        <LayerList.Interface path={[...path, 'layers']} layers={layer.layers} fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
