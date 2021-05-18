import Shape from './';
import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { LayerWrapper, onChange } from '../ui/common';
import Prefabs from '../ui/prefabs';
import { range } from 'lodash';
import NumberInput from '../ui/numberinput';
import Field from '../ui/field';
import Dropdown from '../ui/dropdown';
import LayerList from './layerlist';
import Interpolation from '../util/interpolation';

const getRadius = (radius, scribe, sides) => {
    switch (scribe) {
        case "middle": return (radius + radius / (Math.cos(Math.PI / sides))) / 2;
        case "inscribe": return radius / (Math.cos(Math.PI / sides));
        default: return radius;
    }
}

export const Drawing = ({ path, posMode, x, y, r, t, rotation, radius, scribeMode, thetaMode, count, layers, scaleCurve, thetaCurve, scaleFactor, scale, visible, renderAsMask, colors }) => {
    if (!visible) { return null }
    if (count <= 0 || layers.length <= 0) {
        return null;
    }

    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const rad = getRadius(radius.value * radius.unit * (radius.useScale ? scale : 1), scribeMode, count);

    const children = range(count).map((n) => {
        const coeff = Interpolation.lerp(Interpolation.delerp(n, 0, count), 0, 360, thetaCurve) - 180;
        const s = Interpolation.lerp(Interpolation.delerp(n, 0, count), 1 * scaleFactor.start, 1 * scaleFactor.end, scaleCurve);
        const nested = layers.map((layer, i) => {
            return <Shape.Drawing key={i} {...layer} path={[...path, 'layers', i]} scale={s} renderAsMask={renderAsMask} colors={colors} />
        });
        return <g key={n} style={{ transform: `rotate(${coeff}deg) translate(0px, ${rad}px)`}}>{nested}</g>
    })
    return <g style={{ transform: `translate(${cx}px,${-cy}px) rotate(${rotation}deg)`}}>{children}</g>
}

Drawing.defaultProps ={
    scale: 1
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <LayerWrapper layer={layer} path={path} name='Vertex Array' withVisibility>
        <Field label={"Count"}>
            <NumberInput value={layer.count} onChange={onChange(dispatch, [...path, 'count'])} min={0} />
        </Field>
        <Prefabs.Length label={"Radius"} value={layer.radius} dispatch={dispatch} path={[...path, 'radius']} min={0} withScale />
        <Field label={"Scribe Mode"}>
            <Dropdown value={layer.scribeMode} onChange={onChange(dispatch, [...path, 'scribeMode'])}>
                <option value={'circumscribe'}>Circumscribe</option>
                <option value={'inscribe'}>Inscribe</option>
                <option value={'middle'}>Middle</option>
            </Dropdown>
        </Field>
        <Field label={"Distribution"}>
            <Dropdown value={layer.thetaCurve} onChange={onChange(dispatch, [...path, 'thetaCurve'])}>
                {Object.keys(Interpolation.curves).map((curve) => {
                    return <option key={curve} value={curve}>{curve}</option>
                })}
            </Dropdown>
        </Field>
        <Field.Group label={"Scale Factors"}>
            <Field label={"Start"}><NumberInput value={layer.scaleFactor.start} onChange={onChange(dispatch, [...path, 'scaleFactor', 'start'])} step={0.001} min={0} /></Field>
            <Field label={"End"}><NumberInput value={layer.scaleFactor.end} onChange={onChange(dispatch, [...path, 'scaleFactor', 'end'])} step={0.001} min={0} /></Field>
            <Field label={"Distribution"}>
                <Dropdown value={layer.scaleCurve} onChange={onChange(dispatch, [...path, 'scaleCurve'])}>
                    {Object.keys(Interpolation.curves).map((curve) => {
                        return <option key={curve} value={curve}>{curve}</option>
                    })}
                </Dropdown>
            </Field>
        </Field.Group>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Field.Heading>Sub Layers</Field.Heading>
        <LayerList.Interface path={[...path, 'layers']} layers={layer.layers} fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
