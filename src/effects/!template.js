import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import { EffectWrapper } from '../ui/common';

export const Drawing = ({ path, definition, children }) => {
    const effectId = path.join("_");
    return <>
        <filter id={`${effectId}`} filterUnits="userSpaceOnUse" width="200%" height="200%" x="-100%" y="-100%">

        </filter>
        <g filter={`url(#${effectId})`}>{children}</g>
    </>
}

export const Interface = ({ definition, path }) => {
    const dispatch = useContext(DispatchContext);
    return <EffectWrapper name='Skechify' path={path} definition={definition}>

    </EffectWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
