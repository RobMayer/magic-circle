import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { LayerWrapper, onValue } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import LayerList from './layerlist';
import Checkbox from '../ui/checkbox';
import Shape from './';

export const Drawing = ({ path, posMode, x, y, r, t, rotation, masks, layers, scale, showMask, invertMask, visible, renderAsMask, colors }) => {
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    const maskId = [...path, 'mask'].join("_");
    const maskChildren = masks.map((layer, i) => {
        return <Shape.Drawing key={i} path={[...path, 'masks', i]} scale={scale} {...layer} renderAsMask={invertMask ? "inverted" : "normal"} colors={colors} />
    });
    const children = layers.map((layer, i) => {
        return <Shape.Drawing key={i} path={[...path, 'layers', i]} scale={scale} {...layer} renderAsMask={renderAsMask} colors={colors} />
    });
    return <g style={{ transform: `translate(${cx}px, ${-cy}px) rotate(${rotation}deg)` }}>
        { showMask ? <g><rect x="-100%" y="-100%" width="200%" height="200%" fill={invertMask ? "#fff" : "#000"} />{maskChildren}</g> : <>
            <mask id={maskId}>
                <rect x="-100%" y="-100%" width="200%" height="200%" fill={invertMask ? "#fff" : "#000"} />
                {maskChildren}
            </mask>
            <g mask={`url(#${maskId})`}>{children}</g>
        </>}
    </g>
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <LayerWrapper layer={layer} path={path} name='Mask' withVisibility>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Field label={"Invert Mask"} inlineLabel>
            <Checkbox value={layer.invertMask} onChange={onValue(dispatch, [...path, 'invertMask'])} />
        </Field>
        <Field label={"Show Mask"} inlineLabel>
            <Checkbox value={layer.showMask} onChange={onValue(dispatch, [...path, 'showMask'])} />
        </Field>
        <Field.Heading>Mask</Field.Heading>
        <LayerList.Interface path={[...path, 'masks']} layers={layer.masks} fromMask />
        <Field.Heading>Content</Field.Heading>
        <LayerList.Interface path={[...path, 'layers']} layers={layer.layers} fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
