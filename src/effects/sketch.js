import Field from '../ui/field';
import NumberInput from '../ui/numberinput';
import SliderInput from '../ui/sliderinput';
import { useContext } from 'react';
import { onChange } from '../ui/common';
import { DispatchContext } from '../contexts';
import { EffectWrapper } from '../ui/common';
import Prefabs from '../ui/prefabs';

const Comment = () => null;

export const Drawing = ({ path, children, seed, shake, nib }) => {
    const effectId = path.join("_");
    return <>
        <filter id={`${effectId}`} filterUnits="userSpaceOnUse" width="200%" height="200%" x="-100%" y="-100%">

            <feGaussianBlur stdDeviation="0.5" />
            <feColorMatrix result='out_prime' type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"/>

            <feTurbulence type="fractalNoise" baseFrequency={0.01} numOctaves="1" seed={seed} result='fractal1' />
            <feTurbulence type="fractalNoise" baseFrequency={0.02} numOctaves="1" seed={seed + 900} result='fractal2' />
            <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves="1" seed={seed + 15007} result='fractal3' />

            <feDisplacementMap in="SourceGraphic" in2="fractal1" scale={shake * 10} xChannelSelector="G" yChannelSelector="R" />
                <feMorphology radius={nib.value * nib.unit / 4} operator="dilate" />
                <feGaussianBlur stdDeviation="0.5" />
                <feMorphology radius={nib.value * nib.unit / 4} operator="erode" />
                <feColorMatrix result='out_1' type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"/>
            <feDisplacementMap in="SourceGraphic" in2="fractal2" scale={shake * 10} xChannelSelector="B" yChannelSelector="G" />
                <feMorphology radius={nib.value * nib.unit / 4} operator="dilate" />
                <feGaussianBlur stdDeviation="0.5" />
                <feMorphology radius={nib.value * nib.unit / 4} operator="erode" />
                <feColorMatrix result='out_2' type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"/>
            <feDisplacementMap in="SourceGraphic" in2="fractal3" scale={shake * 10} xChannelSelector="G" yChannelSelector="R" />
                <feMorphology radius={nib.value * nib.unit / 4} operator="dilate" />
                <feGaussianBlur stdDeviation="0.5" />
                <feMorphology radius={nib.value * nib.unit / 4} operator="erode" />
                <feColorMatrix result='out_3' type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.5 0"/>
            <feBlend in2='out_1' mode='multiply' />
            <feBlend in2='out_2' mode='multiply' />
            <feBlend in2='out_prime' mode='multiply' />


            <Comment>
            </Comment>

        </filter>
        <g filter={`url(#${effectId})`}>{children}</g>
    </>
}

export const Interface = ({ definition, path }) => {
    const dispatch = useContext(DispatchContext);
    return <EffectWrapper name='Sketch' path={path} definition={definition}>
        <Field label={"Seed"}>
            <NumberInput value={definition.seed} onChange={onChange(dispatch, [...path, 'seed'])} step={1} />
        </Field>
        <Field label={"Shake"}>
            <SliderInput value={definition.shake} onChange={onChange(dispatch, [...path, 'shake'])} min={0} max={1} step={0.001} />
            <NumberInput value={definition.shake} onChange={onChange(dispatch, [...path, 'shake'])} step={0.001} />
        </Field>
        <Prefabs.Length label={"Nib"} dispatch={dispatch} value={definition.nib} path={[...path, 'nib']} />
    </EffectWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
