import { useContext } from 'react';
import { DispatchContext } from '../contexts';
import BlockInput from '../ui/blockinput';
import { Wrapper } from '../ui/common';

export const Drawing = (props) => {
    return null
}

export const Interface = ({ layer, path }) => {
    const dispatch = useContext(DispatchContext);
    return <Wrapper layer={layer} path={path} name='Note'>
        <BlockInput value={layer.note} onChange={(e) => {
            dispatch({ action: "edit", path: `${path}.note`, value: e.target.value})
        }} />
    </Wrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
