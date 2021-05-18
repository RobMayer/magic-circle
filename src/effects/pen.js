import Field from '../ui/field';
import NumberInput from '../ui/numberinput';
import SliderInput from '../ui/sliderinput';
import { useContext } from 'react';
import { onChange } from '../ui/common';
import { DispatchContext } from '../contexts';
import { EffectWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';

export const Drawing = ({ path, children, seed, smudge, spatter, nib }) => {
    const effectId = path.join("_");
    return <>
        <filter id={`${effectId}`} filterUnits="userSpaceOnUse" width="200%" height="200%" x="-100%" y="-100%">
            <feTurbulence type="fractalNoise" baseFrequency={2} numOctaves="1" result='fractal' seed={seed} />
            <feGaussianBlur stdDeviation={1 - spatter} result='fractal' />
            <feMorphology in="SourceGraphic" radius={nib.value * nib.unit / 4} operator="dilate" />
            <feDisplacementMap in2="fractal" scale={20} xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur stdDeviation={smudge} result='fractal' />
            <feMorphology radius={nib.value * nib.unit / 4} operator="erode" />
            <feBlend in2="SourceGraphic" />
        </filter>
        <g filter={`url(#${effectId})`}>{children}</g>
    </>
}

export const Interface = ({ definition, path }) => {
    const dispatch = useContext(DispatchContext);
    return <EffectWrapper name='Pen' path={path} definition={definition}>
        <Field label={"Seed"}>
            <NumberInput value={definition.seed} onChange={onChange(dispatch, [...path, 'seed'])} step={1} />
        </Field>
        <Field label={"Smudge"}>
            <SliderInput value={definition.smudge} onChange={onChange(dispatch, [...path, 'smudge'])} min={0} max={1} step={0.01} />
            <NumberInput value={definition.smudge} onChange={onChange(dispatch, [...path, 'smudge'])} step={0.01} />
        </Field>
        <Field label={"Spatter"}>
            <SliderInput value={definition.spatter} onChange={onChange(dispatch, [...path, 'spatter'])} min={0} max={1} step={0.01} />
            <NumberInput value={definition.spatter} onChange={onChange(dispatch, [...path, 'spatter'])} step={0.01} />
        </Field>
        <Prefabs.Length label={"Nib"} dispatch={dispatch} value={definition.nib} path={[...path, 'nib']} />
    </EffectWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
