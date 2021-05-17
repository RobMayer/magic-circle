import { useContext } from 'react';
import { DispatchContext, ColorContext } from '../contexts';
import { Wrapper, onChange, onValue } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import Checkbox from '../ui/checkbox';
import NumberInput from '../ui/numberinput';

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radialMode, radius, pie, coverage, fill, stroke, scale, visible, renderAsMask }) => {
    const colors = useContext(ColorContext);
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "none" ? "none" : colors[fill.option] ?? fill.color,
        stroke: stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? scale : 1)),
        transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`
    }
    if (renderAsMask === "inverted") {
        styles.fill = fill.option === "foreground" ? "#000" : fill.option === "background" ? "#fff" : "none";
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.fill = fill.option === "foreground" ? "#fff" : fill.option === "background" ? "#000" : "none";
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }

    const rad = (radius.value * radius.unit * (radius.usesScale ? scale : 1));

    const startX = rad * Math.cos((coverage.start - 90) * Math.PI / 180);
    const startY = rad * Math.sin((coverage.start - 90) * Math.PI / 180);
    const midX = rad * Math.cos(((coverage.start - 90) + (coverage.end - 90)) / 2 * Math.PI / 180);
    const midY = rad * Math.sin(((coverage.start - 90) + (coverage.end - 90)) / 2 * Math.PI / 180);
    const endX = rad * Math.cos((coverage.end - 90) * Math.PI / 180);
    const endY = rad * Math.sin((coverage.end - 90) * Math.PI / 180);
    const d = `${pie ? `M 0,0 L ${startX},${startY}` : ` M ${startX},${startY}` } A ${rad},${rad} 0 0 1 ${midX},${midY} A ${rad},${rad} 0 0 1 ${endX},${endY} ${pie ? `L 0,0` : ""}`;
    // const d = `M 0,0 m 0,${-rO} a ${rO},${rO}, 0, 1, 0, 1, 0 Z M 0,0 m 0,${rI} a ${-rI},${-rI}, 0, 1, 1, 1, 0 Z`;
    return <path d={d} style={styles} />
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Arc' withVisibility>
        <Prefabs.Length label={"Radius"} value={layer.radius} dispatch={dispatch} path={`${path}.radius`} min={0} withScale />
        <Field label={"Start θ"} tooltip={"Start Angle"}>
            <NumberInput value={layer.coverage.start} onChange={onChange(dispatch, `${path}.coverage.start`)} min={0} max={360} />
        </Field>
        <Field label={"End θ"} tooltip={"End Angle"}>
            <NumberInput value={layer.coverage.end} onChange={onChange(dispatch, `${path}.coverage.end`)} min={0} max={360} />
        </Field>
        <Field label={"Pie Slice"} tooltip={"Draw Lines to Center"}>
            <Checkbox value={layer.pie} onChange={onValue(dispatch, `${path}.pie`)} />
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
