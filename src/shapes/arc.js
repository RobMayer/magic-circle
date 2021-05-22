import { LayerWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import Checkbox from '../ui/checkbox';
import NumberInput from '../ui/numberinput';

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radialMode, radius, pie, coverage, fill, stroke, tweenScale, visible, renderAsMask, colors, tweenColors }) => {
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "tween" ? (tweenColors?.fill ?? "none") : fill.option === "none" ? "none" : colors[fill.option] ?? fill.color,
        stroke: stroke.option === "tween" ? (tweenColors?.stroke ?? colors['foreground']) : stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? (tweenScale ?? 1) : 1)),
        transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`
    }
    if (renderAsMask === "inverted") {
        styles.fill = fill.option === "foreground" ? "#000" : fill.option === "background" ? "#fff" : "none";
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.fill = fill.option === "foreground" ? "#fff" : fill.option === "background" ? "#000" : "none";
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }

    const rad = (radius.value * radius.unit * (radius.usesScale ? (tweenScale ?? 1) : 1));

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

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Arc' withVisibility>
        <Prefabs.Length label={"Radius"} value={layer.radius} path={[...path, 'radius']} min={0} withScale />
        <Field label={"Start θ"} tooltip={"Start Angle"}>
            <NumberInput value={layer.coverage.start} onDispatch={[...path, 'coverage', 'start']} min={0} max={360} />
        </Field>
        <Field label={"End θ"} tooltip={"End Angle"}>
            <NumberInput value={layer.coverage.end} onDispatch={[...path, 'coverage', 'end']} min={0} max={360} />
        </Field>
        <Field label={"Pie Slice"} tooltip={"Draw Lines to Center"} inlineLabel>
            <Checkbox value={layer.pie} onDispatch={[...path, 'pie']} />
        </Field>
        <Prefabs.Transforms layer={layer} path={path} withRotation />
        <Prefabs.Appearance layer={layer} path={path} withFill withStroke fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
