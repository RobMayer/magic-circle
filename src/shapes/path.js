import { useContext } from 'react';
import { DispatchContext, CanvasContext } from '../contexts';
import { LayerWrapper, onChange } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import BlockInput from '../ui/blockinput';
import Warning from '../ui/warning';

export const Drawing = ({ path, posMode, x, y, r, t, s, rotation, definition, fill, stroke, scale, visible, renderAsMask, colors }) => {
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "none" ? "none" : colors[fill.option] ?? fill.color,
        stroke: stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (1 / s) * (stroke.useScale ? scale : 1)),
        transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg) scale(${s})`
    }
    if (renderAsMask === "inverted") {
        styles.fill = fill.option === "foreground" ? "#000" : fill.option === "background" ? "#fff" : "none";
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.fill = fill.option === "foreground" ? "#fff" : fill.option === "background" ? "#000" : "none";
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }
    return <path d={definition} style={styles} />
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    const { w, h } = useContext(CanvasContext);
    return <LayerWrapper layer={layer} path={path} name='Path' withVisibility>
        <Warning title={"Proceed With Caution"}>
            <p>This feature is a bit closer to the "bare metal", so might be more difficult to use. The below field expects the contents of the 'd' attribute of SVG's 'path' tag; read more at <a href='https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths' target='_blank' rel='noreferrer'>MDN</a> about SVG path commands.</p>
            <p>This path is dependant on the coordinate system of the canvas. For your reference, know that the canvas's viewBox is '<code className='highlight selectable'>{`${w.value * w.unit / -2} ${h.value * h.unit / -2} ${w.value * w.unit} ${h.value * h.unit}`}</code>' and all points are drawn in that coordinate space.</p>
        </Warning>
        <Field label={"Definition"}>
            <BlockInput value={layer.definition} onChange={onChange(dispatch, [...path, 'definition'])} />
        </Field>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation withScale />
        <Prefabs.Appearance layer={layer} path={path} dispatch={dispatch} withFill withStroke fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
