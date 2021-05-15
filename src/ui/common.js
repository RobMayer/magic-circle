import { useContext } from 'react';
import { DispatchContext, ClipboardContext } from '../contexts';
import TextInput from './textinput';
import { cloneDeep } from 'lodash';
import Checkbox from './checkbox';

export const onChange = (dispatch, path) => {
    return (evt) => {
        dispatch({ action: 'edit', path, value: evt.target.value })
    }
}

export const onValue = (dispatch, path) => {
    return (value) => {
        dispatch({ action: 'edit', path, value })
    }
}

export const Wrapper = ({ name, layer, path, children, withVisibility }) => {
    const dispatch = useContext(DispatchContext);
    const [,setClipboard] = useContext(ClipboardContext);

    const isOpen = layer.isOpen;

    return <div className='layer'>
        <div className={`layertitle`}>
            <div onClick={(e) => { dispatch({ action: 'edit', path: `${path}.isOpen`, value: !isOpen}) }} className='layertype'> {isOpen ? "\u25BC" : "\u25BA"} {name}</div>
            <div className='layername'>{layer.name}</div>
            {withVisibility ?
                <Checkbox tooltip={"Hide/Show Layer"} value={layer.visible} onChange={(e) => { dispatch({ action: "edit", path: `${path}.visible`, value: !layer.visible })}} />
            : null }
            <button className='symbol' onClick={(e) => { dispatch({ action: "shiftup", path })}} >{"\u25B2"}</button>
            <button className='symbol' onClick={(e) => { dispatch({ action: "shiftdn", path })}} >{"\u25BC"}</button>
            <button className='bad-symbol' onClick={(e) => { dispatch({ action: "remove", path }) }}>{"\u2716"}</button>
        </div>
        {isOpen ?
            <div className='controls'>
                <div className='layeroptions'>
                <TextInput value={layer.name} onChange={onChange(dispatch, `${path}.name`)} />
                <button title="Cut" className='symbol' onClick={() => {
                    setClipboard(cloneDeep(layer));
                    dispatch({ action: "remove", path });
                }}>&#x2702;</button>
                <button title="Copy" className='symbol' onClick={() => {
                    setClipboard(cloneDeep(layer));
                }}>&#x1F5D7;</button>
                </div>
                {children}
            </div>
         : null }
    </div>
}

const output = {
    Wrapper,
    onChange,
    onValue
}

export default output;
