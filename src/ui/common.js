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
            <div onClick={(e) => { dispatch({ action: 'edit', path: `${path}.isOpen`, value: !isOpen}) }} className='layerfold'>{isOpen ? "\u25BC" : "\u25BA"}</div>
            {withVisibility ?
                <Checkbox wrapperClass={'layervis'} tooltip={"Hide/Show Layer"} value={layer.visible} onChange={(e) => { dispatch({ action: "edit", path: `${path}.visible`, value: !layer.visible })}} />
                : <Checkbox wrapperClass={'layervis'} checked={false} disabled={true} />
            }
            <div className='layertype'>{name}</div>
            <TextInput wrapperClass={'layername'} className={'layername_field'} value={layer.name} onChange={onChange(dispatch, `${path}.name`)} placeholder={"layer name"} />
            <div className='layercmd'>
                <button title="Copy" className='symbol' onClick={() => {
                    setClipboard(cloneDeep(layer));
                }}>&#x1F5D7;</button>
                <button title="Cut" className='symbol' onClick={() => {
                    setClipboard(cloneDeep(layer));
                    dispatch({ action: "remove", path });
                }}>&#x2702;</button>
                <button className='bad-symbol layerdel' onClick={(e) => { dispatch({ action: "remove", path }) }}>{"\u2716"}</button>
            </div>
            <button className='symbol layersort sortup' onClick={(e) => { dispatch({ action: "shiftup", path })}} >{"\u25B2"}</button>
            <button className='symbol layersort sortdn' onClick={(e) => { dispatch({ action: "shiftdn", path })}} >{"\u25BC"}</button>
        </div>
        {isOpen ?
            <div className='controls'>
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
