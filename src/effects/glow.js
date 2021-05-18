import Field from '../ui/field';
import NumberInput from '../ui/numberinput';
import { useContext } from 'react';
import { onChange } from '../ui/common';
import { DispatchContext } from '../contexts';
import { EffectWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';

export const Drawing = ({ path, definition, children, blur, spread }) => {
    const effectId = path.join("_");
    return <>
        <filter id={`${effectId}`} filterUnits="userSpaceOnUse" width="200%" height="200%" x="-100%" y="-100%">
            <feMorphology in="SourceGraphic" radius={spread.value * spread.unit} operator="dilate" />
            <feGaussianBlur stdDeviation={(blur === "" ? "0" : blur) ?? "0"} result='glow' />
            <feColorMatrix in='SourceGraphic' type="matrix" values="0 0 0 0 1, 0 0 0 0 1, 0 0 0 0 1, 0 0 0 1 0"/>
            <feBlend in2='glow' mode='screen' />
        </filter>
        <g filter={`url(#${effectId})`}>{children}</g>
    </>
}

export const Interface = ({ definition, path }) => {
    const dispatch = useContext(DispatchContext);
    return <EffectWrapper name='Glow' path={path} definition={definition}>
        <Field label={"Blur"}>
            <NumberInput value={definition.blur} onChange={onChange(dispatch, [...path, 'blur'])} step={0.01} />
        </Field>
        <Prefabs.Length label={"Spread"} dispatch={dispatch} value={definition.spread} path={[...path, 'spread']} />
    </EffectWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
