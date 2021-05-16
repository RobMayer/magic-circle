import { useContext } from 'react';
import { DispatchContext, CanvasContext } from '../contexts';
import { Wrapper, onChange } from '../ui/common';
import Prefabs from '../ui/prefabs';
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

export const Drawing = ({ path, posMode, x, y, r, t, radius, sides, fill, rotation, stroke, thetaCurve, scale, visible, renderAsMask }) => {
    const canvas = useContext(CanvasContext);
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "none" ? "none" : canvas[fill.option] ?? fill.color,
        stroke: stroke.option === "none" ? "none" : canvas[stroke.option] ?? stroke.color,
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
    const rad = getRadius(radius.value * radius.unit * (radius.useScale ? scale : 1), radius.scribe, sides);
    return <polygon points={range(sides).map((i) => {
        const coeff = Interpolation.lerp(Interpolation.delerp(i, 0, sides), 0, 360, thetaCurve);
        return `${rad * Math.cos(deg2rad(coeff - 90))},${rad * Math.sin(deg2rad(coeff - 90))}`
    }).join(" ")} style={styles} />
}
Drawing.defaultProps = {
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Polygon' withVisibility>
        <Prefabs.Radius label={"Radius"} value={layer.radius} dispatch={dispatch} path={`${path}.radius`} withScribe withScale />
        <Field label={"Sides"} columns={"2fr 1fr"}>
            <SliderInput value={layer.sides} onChange={onChange(dispatch, `${path}.sides`)} min={3} max={24} step={1} />
            <NumberInput value={layer.sides} onChange={onChange(dispatch, `${path}.sides`)} min={3} max={24} step={1} />
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
