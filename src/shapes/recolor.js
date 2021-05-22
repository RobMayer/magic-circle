import { LayerWrapper } from '../ui/common';
import ColorInput from '../ui/colorinput';
import Field from '../ui/field';
import LayerList from './layerlist';
import Shape from './';

export const Drawing = ({ path, layers, tweenScale, visible, renderAsMask, colors, foreground, background }) => {
    if (!visible) { return null }
    return layers.map((layer, i) => {
        return <Shape.Drawing key={i} path={[...path, 'layers', i]} tweenScale={tweenScale} {...layer} renderAsMask={renderAsMask} colors={{ ...colors, foreground, background }} />
    });
}

export const Interface = ({ layer, path, fromMask }) => {
    return <LayerWrapper layer={layer} path={path} name='Recolor' withVisibility>
        <Field label={"Foreground"}>
            <ColorInput value={layer.foreground} onDispatch={[...path, 'foreground']} />
        </Field>
        <Field label={"Background"}>
            <ColorInput value={layer.background} onDispatch={[...path, 'background']} />
        </Field>
        <Field.Heading>Sub-Layers</Field.Heading>
        <LayerList.Interface path={[...path, 'layers']} layers={layer.layers} fromMask={fromMask} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
