import { useContext } from 'react';
import { DispatchContext, CanvasContext } from '../contexts';
import { Wrapper, onValue } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Tabs from '../ui/tabs';

export const Drawing = ({ path, posMode, x, y, r, t, radialMode, inner, outer, radius, spread, fill, stroke, scale, visible, renderAsMask }) => {
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
    const rO = radialMode === "innerouter" ? (outer.value * outer.unit * (outer.usesScale ? scale : 1)) : (radius.value * radius.unit * (radius.usesScale ? scale : 1) + (spread.value * spread.unit * (spread.usesScale ? scale : 1)) / 2);
    const rI = radialMode === "innerouter" ? (inner.value * inner.unit * (inner.usesScale ? scale : 1)) : (radius.value * radius.unit * (radius.usesScale ? scale : 1) - (spread.value * spread.unit * (spread.usesScale ? scale : 1)) / 2);

    const d = `M 0,0 m 0,${-rO} a ${rO},${rO}, 0, 1, 0, 1, 0 Z M 0,0 m 0,${rI} a ${-rI},${-rI}, 0, 1, 1, 1, 0 Z`;
    return <path d={d} style={styles} />
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Ring' withVisibility>
        <Tabs value={layer.radialMode} onChange={onValue(dispatch, `${path}.radialMode`)}>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Radius label={"Radius (Inner)"} value={layer.inner} dispatch={dispatch} path={`${path}.inner`} withScale />
                <Prefabs.Radius label={"Radius (Outer)"} value={layer.outer} dispatch={dispatch} path={`${path}.outer`} withScale />
            </Tabs.Option>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
                <Prefabs.Radius label={"Radius"} value={layer.radius} dispatch={dispatch} path={`${path}.radius`} withScale />
                <Prefabs.Length label={"Spread"} value={layer.spread} dispatch={dispatch} path={`${path}.spread`} min={0} withScale />
            </Tabs.Option>
        </Tabs>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} />
        <Prefabs.Appearance layer={layer} path={path} dispatch={dispatch} withFill withStroke fromMask={fromMask} />
    </Wrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
