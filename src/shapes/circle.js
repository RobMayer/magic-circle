import { useContext } from 'react';
import { DispatchContext, CanvasContext } from '../contexts';
import { Wrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';

export const Drawing = ({ path, posMode, x, y, r, t, radius, fill, stroke, scale, visible, renderAsMask }) => {
    const canvas = useContext(CanvasContext);
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "none" ? "none" : canvas[fill.option] ?? fill.color,
        stroke: stroke.option === "none" ? "none" : canvas[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? scale : 1)),
        transform: `translate(${cx}px,${-cy}px)`
    }
    if (renderAsMask === "inverted") {
        styles.fill = fill.option === "foreground" ? "#000" : fill.option === "background" ? "#fff" : "none";
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.fill = fill.option === "foreground" ? "#fff" : fill.option === "background" ? "#000" : "none";
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }
    const rad = radius.value * radius.unit * (radius.useScale ? scale : 1);
    const d = `M ${rad},0 A 1,1 0 1,0 ${-rad},0 A 1,1 0 1,0 ${rad},0`;
    return <path d={d} style={styles} />
}
Drawing.defaultProps = {
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Circle' withVisibility>
        <Prefabs.Radius label={"Radius"} value={layer.radius} dispatch={dispatch} path={`${path}.radius`} min={0} withScale />
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} />
        <Prefabs.Appearance layer={layer} path={path} dispatch={dispatch} withFill withStroke fromMask={fromMask} />
    </Wrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
