import Shape from './';
import { LayerWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import { range } from 'lodash';
import NumberInput from '../ui/numberinput';
import Checkbox from '../ui/checkbox';
import Field from '../ui/field';
import Dropdown from '../ui/dropdown';
import GradientInput from '../ui/gradientinput';
import SplineInput from '../ui/splineinput';
import LayerList from './layerlist';
import Interpolation from '../util/interpolation';
import Gradient from '../util/gradient';
import Spline from '../util/spline';

const getRadius = (radius, scribe, sides) => {
    switch (scribe) {
        case "middle": return (radius + radius / (Math.cos(Math.PI / sides))) / 2;
        case "inscribe": return radius / (Math.cos(Math.PI / sides));
        default: return radius;
    }
}

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radius, scribeMode, thetaMode, count, layers, scaleCurve, thetaCurve, scaleFactor, tweenColors, tweenScale, visible, renderAsMask, colors, colorFactorFill, colorFactorStroke, colorFactorInherit
 }) => {
    if (!visible) { return null }
    if (count <= 0 || layers.length <= 0) {
        return null;
    }

    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const rad = getRadius(radius.value * radius.unit * (radius.useScale ? (tweenScale ?? 1) : 1), scribeMode, count);

    const children = range(count).map((n) => {
        const coeff = Interpolation.delerp(n, 0, count);
        const rot = Interpolation.lerp(coeff, 0, 360, thetaCurve) - 180;
        const s = Spline.fromString(scaleFactor).getValueAt(coeff);
        const c = {
            stroke: Gradient.fromString(colorFactorStroke).getColorAt(coeff),
            fill: Gradient.fromString(colorFactorFill).getColorAt(coeff)
        }
        const nested = layers.map((layer, i) => {
            return <Shape.Drawing key={i} {...layer} path={[...path, 'layers', i]} tweenScale={s} tweenColors={colorFactorInherit ? (tweenColors ?? c) : c} renderAsMask={renderAsMask} colors={colors} />
        });
        return <g key={n} style={{ transform: `rotate(${rot}deg) translate(0px, ${rad}px)`}}>{nested}</g>
    })
    return <g style={{ transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`}}>{children}</g>
}

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Vertex Array' withVisibility>
        <Field label={"Count"}>
            <NumberInput value={layer.count} onDispatch={[...path, 'count']} min={0} />
        </Field>
        <Prefabs.Length label={"Radius"} value={layer.radius} path={[...path, 'radius']} min={0} withScale />
        <Field label={"Scribe Mode"}>
            <Dropdown value={layer.scribeMode} onDispatch={[...path, 'scribeMode']}>
                <option value={'circumscribe'}>Circumscribe</option>
                <option value={'inscribe'}>Inscribe</option>
                <option value={'middle'}>Middle</option>
            </Dropdown>
        </Field>
        <Field label={"Distribution"}>
            <Dropdown value={layer.thetaCurve} onDispatch={[...path, 'thetaCurve']}>
                {Object.entries(Interpolation.CURVE_NAMES).map(([k, v]) => {
                    return <option key={k} value={k}>{v}</option>
                })}
            </Dropdown>
        </Field>
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
