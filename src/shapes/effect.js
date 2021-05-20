import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { LayerWrapper, onValue } from '../ui/common';
import Prefabs from '../ui/prefabs';
import Field from '../ui/field';
import LayerList from './layerlist';
import { EFFECTS } from '../util/validation';
import Shape from './';
import Icon from '../ui/icon';
import Checkbox from '../ui/checkbox';
import Effect from '../effects';

const NewEffect = ({ path }) => {
    const dispatch = useContext(DispatchContext);
    return <div className="newlayer">
        {Object.entries(EFFECTS).map(([ type, { term, validate, warning } ]) => {
            const wrn = warning ? <Icon.WARNING className={'newlayer_warning'} tooltip={warning} /> : null;
            return <button className='good' key={type} onClick={(e) => { console.log(path); dispatch({ action: "edit", path, value: validate({}, []) }); }}>{wrn}{term}</button>
        })}
    </div>
}

export const Drawing = ({ path, posMode, x, y, r, t, rotation, definition, showEffect, layers, tweenScale, tweenColors, visible, renderAsMask, colors }) => {
    if (!visible) { return null }
    const cx = posMode === 'cartesian' ? x.value * x.unit : (r.value * r.unit) * Math.cos((-t + 90) * Math.PI / 180);
    const cy = posMode === 'cartesian' ? y.value * y.unit : (r.value * r.unit) * Math.sin((-t + 90) * Math.PI / 180);
    if ((definition ?? null) !== null && showEffect === true) {
        const layerChildren = layers.map((layer, i) => {
            return <Shape.Drawing key={i} path={[...path, 'layers', i]} tweenScale={tweenScale} tweenColors={tweenColors} {...layer} renderAsMask={renderAsMask} colors={colors} />
        });
        return <g style={{ transform: `translate(${cx}px, ${-cy}px) rotate(${rotation}deg)` }}>
            <Effect.Drawing path={path} {...definition}>{layerChildren}</Effect.Drawing>
        </g>
    } else {
        const layerChildren = layers.map((layer, i) => {
            return <Shape.Drawing key={i} path={[...path, 'layers', i]} tweenScale={tweenScale} tweenColors={tweenColors} {...layer} renderAsMask={renderAsMask} colors={colors} />
        });
        return <g style={{ transform: `translate(${cx}px, ${-cy}px) rotate(${rotation}deg)` }}>
            <g>{layerChildren}</g>
        </g>
    }
}

export const Interface = ({ layer, path, fromMask }) => {
    const dispatch = useContext(DispatchContext);
    return <LayerWrapper layer={layer} path={path} name='Effect' withVisibility>
        <Prefabs.Transforms layer={layer} path={path} dispatch={dispatch} withRotation />
        <Field label={"Show Effect"} inlineLabel>
            <Checkbox value={layer.showEffect} onChange={onValue(dispatch, [...path, 'showEffect'])} />
        </Field>
        {
            layer.definition === null ? <NewEffect path={[...path, 'definition']} /> : <Effect.Interface path={[...path, 'definition']} definition={layer.definition} />
        }
        <Field.Heading>Sub-Layers</Field.Heading>
        <LayerList.Interface path={[...path, 'layers']} layers={layer.layers} fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
