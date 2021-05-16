import { useContext } from 'react';
import { DispatchContext, ClipboardContext } from '../contexts';
import TextInput from './textinput';
import { cloneDeep } from 'lodash';
import Checkbox from './checkbox';
import Icon from './icon';

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
            <div onClick={(e) => { dispatch({ action: 'edit', path: `${path}.isOpen`, value: !isOpen}) }} className='layerfold'>{isOpen ? <Icon.ARROW_S /> : <Icon.ARROW_E />}</div>
            <div className='layertype'>{name}</div>
            <TextInput wrapperClass={'layername'} className={'layername_field'} value={layer.name} onChange={onChange(dispatch, `${path}.name`)} placeholder={"layer name"} />
            <div className='layercmd'>
                { withVisibility ?
                    <button title="Copy" className='symbol' onClick={(e) => { dispatch({ action: "edit", path: `${path}.visible`, value: !layer.visible })}} >{layer.visible ? <Icon.PUBLIC /> : <Icon.PRIVATE />}</button>
                : null}
                <button title="Copy" className='symbol' onClick={() => {
                    setClipboard(cloneDeep(layer));
                }}><Icon.COPY /></button>
                <button title="Cut" className='symbol' onClick={() => {
                    setClipboard(cloneDeep(layer));
                    dispatch({ action: "remove", path });
                }}><Icon.CUT /></button>
                <button className='bad-symbol layerdel' onClick={(e) => { dispatch({ action: "remove", path }) }}><Icon.TRASH /></button>
            </div>
            <button className='symbol layersort sortup' onClick={(e) => { dispatch({ action: "shiftup", path })}} ><Icon.ARROW_N /></button>
            <button className='symbol layersort sortdn' onClick={(e) => { dispatch({ action: "shiftdn", path })}} ><Icon.ARROW_S /></button>
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
