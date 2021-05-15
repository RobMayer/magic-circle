import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { Wrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import LayerList from './layerlist';
import Shape from './';

export const Drawing = ({ path, posMode, x, y, r, t, rotation, masks, layers, scale, showMask, invertMask, visible, renderAsMask }) => {
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const children = layers.map((layer, i) => {
        return <Shape.Drawing key={i} path={[...path, 'layers', i]} scale={scale} {...layer} renderAsMask={renderAsMask} />
    });
    return <g style={{ transform: `translate(${cx}px, ${-cy}px) rotate(${rotation}deg)` }}>
        <g>{children}</g>
    </g>
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Group' withVisibility>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Field.Heading>Sub-Layers</Field.Heading>
        <LayerList.Interface path={`${path}.layers`} layers={layer.layers} fromMask={fromMask} />
    </Wrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
