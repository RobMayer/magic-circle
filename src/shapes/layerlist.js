import Shapes from './';
import { LAYERS } from '../util/validation';
import { useContext, useState } from 'react';
import { DispatchContext, ClipboardContext } from '../contexts';
import { cloneDeep } from 'lodash';
import Field from '../ui/field';
import Icon from '../ui/icon';

const NewLayer = ({ path }) => {
    const dispatch = useContext(DispatchContext);
    const [clipboard] = useContext(ClipboardContext);
    const [isOpen, setIsOpen] = useState(false);
    return <div className="newlayer">
        {isOpen ?
            <>
            <div className='newlayeroptions'>
                <div></div>
                <button className='good-symbol' disabled={clipboard === null} onClick={(e) => {
                    console.log(path, clipboard);
                    dispatch({ action: "append", path, value: cloneDeep(clipboard) });
                    setIsOpen(false);
                }}><Icon.PASTE /></button>
                <button className='bad-symbol' onClick={(e) => { setIsOpen(false); }}><Icon.CLOSE /></button>
            </div>
            <Field.SubHeading>Shapes</Field.SubHeading>
            {Object.entries(LAYERS).filter(([type, { category }]) => category === "shape").map(([ type, { term, validate, warning } ]) => {
                const wrn = warning ? <Icon.WARNING className={'newlayer_warning'} tooltip={warning} /> : null;
                return <button className='good' key={type} onClick={(e) => { dispatch({ action: "append", path, value: validate({}, []) }); setIsOpen(false); }}>{wrn}{term}</button>
            })}
            <Field.SubHeading>Collections</Field.SubHeading>
            {Object.entries(LAYERS).filter(([type, { category }]) => category === "collection").map(([ type, { term, validate, warning } ]) => {
                const wrn = warning ? <Icon.WARNING className={'newlayer_warning'} tooltip={warning} /> : null;
                return <button className='good' key={type} onClick={(e) => { dispatch({ action: "append", path, value: validate({}, []) }); setIsOpen(false); }}>{wrn}{term}</button>
            })}
            <Field.SubHeading>Utility</Field.SubHeading>
            {Object.entries(LAYERS).filter(([type, { category }]) => category === "utility").map(([ type, { term, validate, warning } ]) => {
                const wrn = warning ? <Icon.WARNING className={'newlayer_warning'} tooltip={warning} /> : null;
                return <button className='good' key={type} onClick={(e) => { dispatch({ action: "append", path, value: validate({}, []) }); setIsOpen(false); }}>{wrn}{term}</button>
            })}
            </>
        :
        <div className='newlayeroptions'>
            <button className='good' onClick={(e) => { setIsOpen(!isOpen) }}>New Layer</button>
        </div>
        }
    </div>
}

export const Drawing = ({ path, layers, renderAsMask, colors }) => {
    return <>
        {layers.map(({ type, ...layer }, i) => {
            return <Shapes.Drawing type={type} {...layer} path={[...path, i]} key={i} renderAsMask={renderAsMask} colors={colors} />
        })}
    </>
}

export const Interface = ({ layers, path, fromMask }) => {
    return <div className='layerlist'>
        <NewLayer path={path} />
        {layers.map(({ type, ...layer }, i) => {
            return <Shapes.Interface type={type} {...layer} path={[...path, i]} key={i} fromMask={fromMask} />
        }).reverse()}
    </div>
}

const output = {
    Drawing,
    Interface
}

export default output;
