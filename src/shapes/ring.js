import { LayerWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Tabs from '../ui/tabs';

export const Drawing = ({ path, posMode, x, y, r, t, radialMode, inner, outer, radius, spread, fill, stroke, tweenScale, tweenColors, visible, renderAsMask, colors }) => {
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const styles = {
        fill: fill.option === "tween" ? (tweenColors?.fill ?? "none") : fill.option === "none" ? "none" : colors[fill.option] ?? fill.color,
        stroke: stroke.option === "tween" ? (tweenColors?.stroke ?? colors['foreground']) : stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? (tweenScale ?? 1) : 1)),
        transform: `translate(${cx}px,${-cy}px)`
    }
    if (renderAsMask === "inverted") {
        styles.fill = fill.option === "foreground" ? "#000" : fill.option === "background" ? "#fff" : "none";
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.fill = fill.option === "foreground" ? "#fff" : fill.option === "background" ? "#000" : "none";
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }
    const rO = radialMode === "innerouter" ? (outer.value * outer.unit * (outer.usesScale ? (tweenScale ?? 1) : 1)) : (radius.value * radius.unit * (radius.usesScale ? (tweenScale ?? 1) : 1) + (spread.value * spread.unit * (spread.usesScale ? (tweenScale ?? 1) : 1)) / 2);
    const rI = radialMode === "innerouter" ? (inner.value * inner.unit * (inner.usesScale ? (tweenScale ?? 1) : 1)) : (radius.value * radius.unit * (radius.usesScale ? (tweenScale ?? 1) : 1) - (spread.value * spread.unit * (spread.usesScale ? (tweenScale ?? 1) : 1)) / 2);

    const d = `M ${rO},0 A 1,1 0 0,0 ${-rO},0 A 1,1 0 0,0 ${rO},0 M ${rI},0 A 1,1 0 0,1 ${-rI},0 A 1,1 0 0,1 ${rI},0`;
    return <path d={d} style={styles} />
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Ring' withVisibility>
        <Tabs value={layer.radialMode} onDispatch={[...path, 'radialMode']}>
            <Tabs.Option value={"innerouter"} label={"Inner / Outer"}>
                <Prefabs.Length label={"Radius (Inner)"} value={layer.inner} path={[...path, 'inner']} min={0} withScale />
                <Prefabs.Length label={"Radius (Outer)"} value={layer.outer} path={[...path, 'outer']} min={0} withScale />
            </Tabs.Option>
            <Tabs.Option value={"radiusspread"} label={"Radius / Spread"}>
                <Prefabs.Length label={"Radius"} value={layer.radius} path={[...path, 'radius']} min={0} withScale />
                <Prefabs.Length label={"Spread"} value={layer.spread} path={[...path, 'spread']} min={0} withScale />
            </Tabs.Option>
        </Tabs>
        <Prefabs.Transforms layer={layer} path={path} />
        <Prefabs.Appearance layer={layer} path={path} withFill withStroke fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
