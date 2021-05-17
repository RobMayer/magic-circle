import { useContext } from 'react';
import { DispatchContext, ColorContext } from '../contexts';
import { Wrapper, onValue, onChange } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Tabs from '../ui/tabs';
import SliderInput from '../ui/sliderinput';
import NumberInput from '../ui/numberinput';
import Dropdown from '../ui/dropdown';
import Field from '../ui/field';
import { range } from 'lodash';
import Interpolation from '../util/interpolation';

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
}

const getRadius = (radius, scribe, sides) => {
    switch (scribe) {
        case "middle": return (radius + radius / (Math.cos(Math.PI / sides))) / 2;
        case "inscribe": return radius / (Math.cos(Math.PI / sides));
        default: return radius;
    }
}

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radialMode, inner, points, outer, radius, spread, scribeMode, thetaCurve, fill, stroke, scale, visible, renderAsMask }) => {
    const colors = useContext(ColorContext);
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "none" ? "none" : colors[fill.option] ?? fill.color,
        stroke: stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? scale : 1)),
        transform: `translate(${cx}px, ${-cy}px) rotate(${rotation}deg)`
    }
    if (renderAsMask === "inverted") {
        styles.fill = fill.option === "foreground" ? "#000" : fill.option === "background" ? "#fff" : "none";
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.fill = fill.option === "foreground" ? "#fff" : fill.option === "background" ? "#000" : "none";
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }
    const rO = radialMode === "innerouter" ? (outer.value * outer.unit * (outer.usesScale ? scale : 1)) : (radius.value * radius.unit * (radius.usesScale ? scale : 1) + (spread.value * spread.unit * (spread.usesScale ? scale : 1)) / 2);
    const rI = radialMode === "innerouter" ? (inner.value * inner.unit * (inner.usesScale ? scale : 1)) : (radius.value * radius.unit * (radius.usesScale ? scale : 1) - (spread.value * spread.unit * (spread.usesScale ? scale : 1)) / 2);

    const p = range(points * 2).map((i) => {
        const coeff = Interpolation.lerp(Interpolation.delerp(i, 0, points * 2), 0, 360, thetaCurve);
        const rad = getRadius(i % 2 === 0 ? rO : rI, scribeMode, points);
        return `${rad * Math.cos(deg2rad(coeff - 90))},${rad * Math.sin(deg2rad(coeff - 90))}`
    })
    return <polygon points={p.join(" ")} style={styles} />
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Star' withVisibility>
        <Tabs value={layer.radialMode} onChange={onValue(dispatch, `${path}.radialMode`)}>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Length label={"Radius (Inner)"} value={layer.inner} dispatch={dispatch} path={`${path}.inner`} min={0} withScale />
                <Prefabs.Length label={"Radius (Outer)"} value={layer.outer} dispatch={dispatch} path={`${path}.outer`} min={0} withScale />
            </Tabs.Option>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
                <Prefabs.Length label={"Radius"} value={layer.radius} dispatch={dispatch} path={`${path}.radius`} min={0} withScale />
                <Prefabs.Length label={"Spread"} value={layer.spread} dispatch={dispatch} path={`${path}.spread`} min={0} withScale />
            </Tabs.Option>
        </Tabs>
        <Field label={"Scribe Mode"}>
            <Dropdown value={layer.scribeMode} onChange={onChange(dispatch, `${path}.scribeMode`)}>
                <option value={'circumscribe'}>Circumscribe</option>
                <option value={'inscribe'}>Inscribe</option>
                <option value={'middle'}>Middle</option>
            </Dropdown>
        </Field>
        <Field label={"Points"} columns={"2fr 1fr"}>
            <SliderInput value={layer.points} onChange={onChange(dispatch, `${path}.points`)} min={3} max={24} step={1} />
            <NumberInput value={layer.points} onChange={onChange(dispatch, `${path}.points`)} min={3} max={24} step={1} />
        </Field>
        <Field label={"Distribution"}>
            <Dropdown value={layer.thetaCurve} onChange={onChange(dispatch, `${path}.thetaCurve`)}>
                {Object.keys(Interpolation.curves).map((curve) => {
                    return <option key={curve} value={curve}>{curve}</option>
                })}
            </Dropdown>
        </Field>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Prefabs.Appearance layer={layer} path={path} dispatch={dispatch} withFill withStroke fromMask={fromMask} />
    </Wrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
