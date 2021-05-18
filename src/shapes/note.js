import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import BlockInput from '../ui/blockinput';
import { LayerWrapper } from '../ui/common';

export const Drawing = (props) => {
    return null
}

export const Interface = ({ layer, path }) => {
    const dispatch = useContext(DispatchContext);
    return <LayerWrapper layer={layer} path={path} name='Note'>
        <BlockInput value={layer.note} onChange={(e) => {
            dispatch({ action: "edit", path: [...path, 'node'], value: e.target.value})
        }} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
