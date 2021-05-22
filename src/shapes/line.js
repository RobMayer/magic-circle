import { LayerWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import Tabs from '../ui/tabs';
import NumberInput from '../ui/numberinput';

export const Drawing = ({ path, posMode, x1, y1, r1, t1, x2, y2, r2, t2, rotation, radialMode, radius, pie, coverage, fill, stroke, tweenScale, tweenColors, visible, renderAsMask, colors }) => {
    if (!visible) { return null }
    const sx = posMode === 'cartesian' ? x1.value * x1.unit : (r1.value * r1.unit) * Math.cos((-t1 + 90) * Math.PI / 180);
    const sy = posMode === 'cartesian' ? y1.value * y1.unit : (r1.value * r1.unit) * Math.sin((-t1 + 90) * Math.PI / 180);
    const ex = posMode === 'cartesian' ? x2.value * x2.unit : (r2.value * r2.unit) * Math.cos((-t2 + 90) * Math.PI / 180);
    const ey = posMode === 'cartesian' ? y2.value * y2.unit : (r2.value * r2.unit) * Math.sin((-t2 + 90) * Math.PI / 180);
    const styles = {
        stroke: stroke.option === "tween" ? (tweenColors?.stroke ?? colors['foreground']) : stroke.option === "none" ? "none" : colors[stroke.option] ?? stroke.color,
        strokeWidth: (stroke.value * stroke.unit * (stroke.useScale ? (tweenScale ?? 1) : 1)),
    }
    if (renderAsMask === "inverted") {
        styles.stroke = stroke.option === "foreground" ? "#000" : stroke.option === "background" ? "#fff" : "none";
    } else if (renderAsMask === "normal") {
        styles.stroke = stroke.option === "foreground" ? "#fff" : stroke.option === "background" ? "#000" : "none";
    }
    return <line x1={sx} x2={ex} y1={-sy} y2={-ey} style={styles} />
}

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Line' withVisibility>
        <Tabs value={layer.posMode} onDispatch={[...path, 'posMode']}>
            <Tabs.Option value={"polar"} label={"Polar"}>
                <Field.Row label={"Start"}>
                    <Prefabs.Length label={"Distance"} value={layer.r1} path={[...path, 'r1']} />
                    <Field label={"Angle"}>
                        <NumberInput value={layer.t1} onDispatch={[...path, 't1']} step={0.001} />
                    </Field>
                </Field.Row>
                <Field.Row label={"End"}>
                    <Prefabs.Length label={"Distance"} value={layer.r2} path={[...path, 'r2']} />
                    <Field label={"Angle"}>
                        <NumberInput value={layer.t2} onDispatch={[...path, 't2']} step={0.001} />
                    </Field>
                </Field.Row>
            </Tabs.Option>
            <Tabs.Option value={"cartesian"} label={"Cartesian"}>
                <Field.Row label={"Start"}>
                    <Prefabs.Length label={"X Position"} value={layer.x1} path={[...path, 'x1']} />
                    <Prefabs.Length label={"Y Position"} value={layer.y1} path={[...path, 'y1']} />
                </Field.Row>
                <Field.Row label={"End"}>
                    <Prefabs.Length label={"X Position"} value={layer.x2} path={[...path, 'x2']} />
                    <Prefabs.Length label={"Y Position"} value={layer.y2} path={[...path, 'y2']} />
                </Field.Row>
            </Tabs.Option>
        </Tabs>
        <Prefabs.Appearance layer={layer} path={path} withStroke fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
