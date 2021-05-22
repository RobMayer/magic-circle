import { LayerWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Checkbox from '../ui/checkbox';
import Tabs from '../ui/tabs';
import { range } from 'lodash';
import NumberInput from '../ui/numberinput';
import Field from '../ui/field';
import Dropdown from '../ui/dropdown';
import Interpolation from '../util/interpolation';

export const Drawing = ({ path, posMode, x, y, r, t, fill, stroke, rotation, radialMode, inner, outer, radius, spread, thetaMode, count, step, coverage, toExtent, thetaCurve, tweenScale, tweenColors, visible, renderAsMask, colors }) => {
    // thetaMode determines how objects are thrown around the circumference
    // radialMode determines the inner and outer radius of
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    if (!visible) { return null }
    if (count <= 0) {
        return null;
    }
    const styles = {
        stroke: stroke.option === "tween" ? (tweenColors?.stroke ?? colors['foreground']) : stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? (tweenScale ?? 1) : 1)),
    }
    if (renderAsMask === "inverted") {
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }

    const rO = radialMode === "innerouter" ? (outer.value * outer.unit * (outer.useScale ? (tweenScale ?? 1) : 1)) : (radius.value * radius.unit * (radius.useScale ? (tweenScale ?? 1) : 1) + (spread.value * spread.unit * (spread.useScale ? (tweenScale ?? 1) : 1)) / 2);
    const rI = radialMode === "innerouter" ? (inner.value * inner.unit * (inner.useScale ? (tweenScale ?? 1) : 1)) : (radius.value * radius.unit * (radius.useScale ? (tweenScale ?? 1) : 1) - (spread.value * spread.unit * (spread.useScale ? (tweenScale ?? 1) : 1)) / 2);

    const doOverlap = thetaMode === "startstop" && !toExtent;

    const children = range(count).map((n) => {
        const coeff = Interpolation.delerp(n, 0, doOverlap ? count : count - 1);
        const angle = thetaMode === "startstop" ? Interpolation.lerp(coeff, 1 * coverage.start, 1 * coverage.end, thetaCurve) : step * n;
        const cos = Math.cos((angle - 90) * Math.PI / 180);
        const sin = Math.sin((angle - 90) * Math.PI / 180);
        return <line key={n} x1={rI * cos} y1={rI * sin} x2={rO * cos} y2={rO * sin} style={styles} />
    })
    return <g style={{ transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`}}>{children}</g>
}

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Burst' withVisibility>
        <Field label={"Count"}>
            <NumberInput value={layer.count} onDispatch={[...path, 'count']} min={0} />
        </Field>
        <Tabs value={layer.radialMode} onDispatch={[...path, 'radialMode']}>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Length label={"Radius (Inner)"} value={layer.inner} path={[...path, 'inner']} withScale min={0} />
                <Prefabs.Length label={"Radius (Outer)"} value={layer.outer} path={[...path, 'outer']} withScale min={0} />
            </Tabs.Option>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
                <Prefabs.Length label={"Radius"} value={layer.radius} path={[...path, 'radius']} withScale min={0} />
                <Prefabs.Length label={"Spread"} value={layer.spread} path={[...path, 'spread']} withScale />
            </Tabs.Option>
        </Tabs>
        <Tabs value={layer.thetaMode} onDispatch={[...path, 'thetaMode']}>
            <Tabs.Option value={"incremental"} label={"Incremental Steps"}>
                <Field label={"θ Increment"} tooltip={"Incremental Angle"}>
                    <NumberInput value={layer.step} onDispatch={[...path, 'step']} />
                </Field>
            </Tabs.Option>
            <Tabs.Option value={"startstop"} label={"Divided Coverage"}>
                <Field label={"Start θ"} tooltip={"Start Angle"}>
                    <NumberInput value={layer.coverage.start} onDispatch={[...path, 'coverage', 'start']} />
                </Field>
                <Field label={"End θ"} tooltip={"End Angle"}>
                    <NumberInput value={layer.coverage.end} onDispatch={[...path, 'coverage', 'end']} />
                </Field>
                <Field>
                    <Checkbox value={layer.toExtent} onDispatch={[...path, 'toExtent']} tooltip={"pushes last line to full coverage"} label={"To Extent"} />
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
        <Prefabs.Transforms layer={layer} path={path} withRotation />
        <Prefabs.Appearance layer={layer} path={path} withStroke fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
