import { useContext } from 'react';
import { DispatchContext, CanvasContext } from '../contexts';
import { Wrapper, onChange, onValue } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Checkbox from '../ui/checkbox';
import Tabs from '../ui/tabs';
import { range } from 'lodash';
import NumberInput from '../ui/numberinput';
import Field from '../ui/field';
import Dropdown from '../ui/dropdown';
import Interpolation from '../util/interpolation';

export const Drawing = ({ path, posMode, x, y, r, t, fill, stroke, rotation, radialMode, inner, outer, radius, spread, thetaMode, count, step, coverage, toExtent, thetaCurve, scale, visible, renderAsMask }) => {
    const canvas = useContext(CanvasContext);
    // thetaMode determines how objects are thrown around the circumference
    // radialMode determines the inner and outer radius of
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    if (!visible) { return null }
    if (count <= 0) {
        return null;
    }
    const styles = {
        stroke: stroke.option === "none" ? "none" : canvas[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? scale : 1))
    }
    if (renderAsMask === "inverted") {
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }

    const rO = radialMode === "innerouter" ? (outer.value * outer.unit * (outer.useScale ? scale : 1)) : (radius.value * radius.unit * (radius.useScale ? scale : 1) + (spread.value * spread.unit * (spread.useScale ? scale : 1)) / 2);
    const rI = radialMode === "innerouter" ? (inner.value * inner.unit * (inner.useScale ? scale : 1)) : (radius.value * radius.unit * (radius.useScale ? scale : 1) - (spread.value * spread.unit * (spread.useScale ? scale : 1)) / 2);

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

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Burst' withVisibility>
        <Field label={"Count"}>
            <NumberInput value={layer.count} onChange={onChange(dispatch, `${path}.count`)} min={0} />
        </Field>
        <Tabs value={layer.radialMode} onChange={onValue(dispatch, `${path}.radialMode`)}>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
                <Prefabs.Length label={"Radius"} value={layer.radius} dispatch={dispatch} path={`${path}.radius`} withScale min={0} />
                <Prefabs.Length label={"Spread"} value={layer.spread} dispatch={dispatch} path={`${path}.spread`} withScale />
            </Tabs.Option>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Length label={"Radius (Inner)"} value={layer.inner} dispatch={dispatch} path={`${path}.inner`} withScale min={0} />
                <Prefabs.Length label={"Radius (Outer)"} value={layer.outer} dispatch={dispatch} path={`${path}.outer`} withScale min={0} />
            </Tabs.Option>
        </Tabs>
        <Tabs value={layer.thetaMode} onChange={onValue(dispatch, `${path}.thetaMode`)}>
            <Tabs.Option value={"incremental"} label={"Incremental Steps"}>
                <Field label={"θ Increment"} tooltip={"Incremental Angle"}>
                    <NumberInput value={layer.step} onChange={onChange(dispatch, `${path}.step`)} />
                </Field>
            </Tabs.Option>
            <Tabs.Option value={"startstop"} label={"Divided Coverage"}>
                <Field label={"Start θ"} tooltip={"Start Angle"}>
                    <NumberInput value={layer.coverage.start} onChange={onChange(dispatch, `${path}.coverage.start`)} />
                </Field>
                <Field label={"End θ"} tooltip={"End Angle"}>
                    <NumberInput value={layer.coverage.end} onChange={onChange(dispatch, `${path}.coverage.end`)} />
                </Field>
                <Field label={"To Extent"} tooltip={"Does not render last node"}>
                    <Checkbox value={layer.toExtent} onChange={onValue(dispatch, `${path}.toExtent`)} />
                </Field>
                <Field label={"Distribution"}>
                    <Dropdown value={layer.thetaCurve} onChange={onChange(dispatch, `${path}.thetaCurve`)}>
                        {Object.keys(Interpolation.curves).map((curve) => {
                            return <option key={curve} value={curve}>{curve}</option>
                        })}
                    </Dropdown>
                </Field>
            </Tabs.Option>
        </Tabs>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Prefabs.Appearance layer={layer} path={path} dispatch={dispatch} withStroke fromMask={fromMask} />
    </Wrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
