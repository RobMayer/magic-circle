import Shapes from './';
import { LAYERS } from '../util/validation';
import { useContext, useState } from 'react';
import { DispatchContext, ClipboardContext } from '../contexts';
import { cloneDeep } from 'lodash';
import Field from '../ui/field';

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
                }}>Paste</button>
                <button className='bad-symbol' onClick={(e) => { setIsOpen(false); }}>{"\u2716"}</button>
            </div>
            <Field.SubHeading>Shapes</Field.SubHeading>
            {Object.entries(LAYERS).filter(([type, { category }]) => category === "shape").map(([ type, { term, validate } ]) => {
                return <button className='good' key={type} onClick={(e) => { dispatch({ action: "append", path, value: validate({}, []) }); setIsOpen(false); }}>{term}</button>
            })}
            <Field.SubHeading>Collections</Field.SubHeading>
            {Object.entries(LAYERS).filter(([type, { category }]) => category === "collection").map(([ type, { term, validate } ]) => {
                return <button className='good' key={type} onClick={(e) => { dispatch({ action: "append", path, value: validate({}, []) }); setIsOpen(false); }}>{term}</button>
            })}
            <Field.SubHeading>Utility</Field.SubHeading>
            {Object.entries(LAYERS).filter(([type, { category }]) => category === "utility").map(([ type, { term, validate } ]) => {
                return <button className='good' key={type} onClick={(e) => { dispatch({ action: "append", path, value: validate({}, []) }); setIsOpen(false); }}>{term}</button>
            })}
            </>
        :
        <div className='newlayeroptions'>
            <button className='good' onClick={(e) => { setIsOpen(!isOpen) }}>New Layer</button>
        </div>
        }
    </div>
}

export const Drawing = ({ path, layers, renderAsMask }) => {
    return <>
        {layers.map(({ type, ...layer }, i) => {
            const p = `${path}[${i}]`;
            return <Shapes.Drawing type={type} {...layer} path={p} key={i} renderAsMask={renderAsMask} />
        })}
    </>
}

export const Interface = ({ layers, path, fromMask }) => {
    return <div className='layerlist'>
        <NewLayer path={path} />
        {layers.map(({ type, ...layer }, i) => {
            const p = `${path}[${i}]`;
            return <Shapes.Interface type={type} {...layer} path={p} key={i} fromMask={fromMask} />
        }).reverse()}
    </div>
}

const output = {
    Drawing,
    Interface
}

export default output;
