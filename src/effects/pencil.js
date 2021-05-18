import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { EffectWrapper } from '../ui/common';
import { onChange } from '../ui/common';
import Field from '../ui/field';
import NumberInput from '../ui/numberinput';

export const Drawing = ({ path, children, seed }) => {
    const effectId = path.join("_");
    return <>
        <filter id={effectId} filterUnits={"userSpaceOnUse"} x={"-100%"} y={"-100%"} width={"200%"} height={"200%"}>
            <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="8" stitchTiles="stitch" result="f1" seed={seed} />
            <feColorMatrix type="matrix" values="0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 -1.5 1.5" result="f2" />
            <feComposite operator="in" in2="f2" in="SourceGraphic" result="f3" />
            <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" result="noise" seed={seed + 500} />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="2.5" in="f3" result="f4" />
        </filter>
        <g filter={`url(#${effectId})`}>{children}</g>
    </>
}

export const Interface = ({ definition, path }) => {
    const dispatch = useContext(DispatchContext);
    return <EffectWrapper name='Pencil' path={path} definition={definition}>
        <Field label={"Seed"}>
            <NumberInput value={definition.seed} onChange={onChange(dispatch, [...path, 'seed'])} step={1} />
        </Field>
    </EffectWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
