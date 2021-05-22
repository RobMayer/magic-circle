import BlockInput from '../ui/blockinput';
import { LayerWrapper } from '../ui/common';

export const Drawing = (props) => {
    return null
}

export const Interface = ({ layer, path }) => {
        return <LayerWrapper layer={layer} path={path} name='Note'>
        <BlockInput value={layer.note} onDispatch={[...path, 'note']} />
    </LayerWrapper>
}

const output = {
    Drawing,
    Interface
}

export default output;
