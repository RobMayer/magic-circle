import { useState, useReducer } from 'react';
import _ from 'lodash/fp';
import LayerList from './shapes/layerlist';
import { DispatchContext, ClipboardContext, CanvasContext } from './contexts';
import Field from './ui/field';
import ColorInput from './ui/colorinput';
import TextInput from './ui/textinput';
import Prefabs from './ui/prefabs';
import { saveAs } from 'file-saver';
import { validateUpload } from './util/validation';
import Icon from './ui/icon';
import LogModal from './ui/logmodal';
import ExportModal from './ui/exportmodal';

const version = "0.8.1";

const handleUpload = (element, file, dispatch) => {
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                const value = validateUpload(json, "");
                console.dir(value);
                if (value) {
                    dispatch({ action: "load", value });
                } else {
                    console.error("problem parsing uploaded file");
                }
            } catch (e) {
                console.error("problem parsing json");
            } finally {
                element.value = null;
            }
        }
        reader.onerror = (evt) => {
            console.error("problem reading file");
            element.value = null;
        }
    }
}

const reducer = (state, { action, path, value }) => {
    if (action === "load") {
        return value;
    } else if (action === "edit") {
        return _.set(path, value, state);
    } else if (action === "append") {
        return _.set(path, [..._.get(path, state), value], state)
    } else if (action === "shiftup" || action === "shiftdn") {
        const pathToEdit = _.toPath(path);
        const idx = Number(pathToEdit.pop());
        if (isNaN(idx)) {
            return state;
        }
        const cur = _.get(pathToEdit, state);
        if (action === 'shiftdn' && idx !== 0) {
            const sorted = [...cur.slice(0, idx - 1), cur[idx], cur[idx - 1], ...cur.slice(idx + 1)];
            return _.set(pathToEdit, sorted, state);
        }
        if (action === 'shiftup' && idx !== cur.length - 1) {
            const sorted = [...cur.slice(0, idx), cur[idx + 1], cur[idx], ...cur.slice(idx + 2)]
            return _.set(pathToEdit, sorted, state);
        }
        return state;
    } else if (action === "remove") {
        const pathToEdit = _.toPath(path);
        const idx = Number(pathToEdit.pop());
        if (isNaN(idx)) {
            return state;
        }
        return _.set(pathToEdit, _.get(pathToEdit, state).filter((el, i) => { return i !== idx }), state)
    } else {
        console.error("unknown dispatch", action, path);
    }
    return state;
}

const initialState = {
    name: "",
    version,
    colors: {
        foreground: "#800",
        background: "#fff",
        canvas: "#fff",
        viewport: "#000"
    },
    dimensions: {
        w: { value: 5, unit: 96 },
        h: { value: 5, unit: 96 },
    },
    layers: []
};

function App() {
    const [isOpen, setIsOpen] = useState(true);
    const [state, dispatch] = useReducer(reducer, initialState);
    const clipboard = useState(null);
    const [modal, setModal] = useState(null);

    const cw = state.dimensions.w.value * state.dimensions.w.unit;
    const ch = state.dimensions.h.value * state.dimensions.h.unit;

    const rH = cw / ch * 100; // 16/9
    const rW = ch / cw * 100;

    return <DispatchContext.Provider value={dispatch}>
        <div id="app">
        <div id="viewport" style={{ backgroundColor: state.colors.viewport }}>
            <div id="canvas" style={{ maxWidth: `${rH}vh`, height:`${rW}vw` }}>
                <svg id="export" viewBox={`${cw / -2} ${ch / -2} ${cw} ${ch}`} style={{ backgroundColor: state.colors.canvas }}>
                    <LayerList.Drawing layers={state.layers} path={["layers"]} colors={state.colors} />
                </svg>
            </div>
        </div>
        <div id='toggle'>
            <button onClick={() => { setIsOpen(!isOpen) }}>{isOpen ? <Icon.ARROW_E /> : <Icon.ARROW_W />}</button>
        </div>
        {isOpen ?
            <div id="controlpanel">
                <Field.Heading>Arcanigen</Field.Heading>
                <div className='controls'>
                <Field.Group label={"About"}>
                    <Field.Row label={"Ver"}>
                        <code>{version} [<button className='link' onClick={() => { setModal("changelog"); }}>Changelog</button>]</code>
                    </Field.Row>
                    <Field.Row label={<Icon.TWITTER className={"large"} />}>
                        <a href='https://twitter.com/ThatRobHuman' rel='noreferrer' target='_blank'>@ThatRobHuman</a>
                    </Field.Row>
                    <Field.Row label={<Icon.INSTAGRAM className={"large"} />}>
                        <a href='https://www.instagram.com/thatrobhuman/' rel='noreferrer' target='_blank'>ThatRobHuman</a>
                    </Field.Row>
                    <Field.Row label={<Icon.ETSY className={"large"} />}>
                        <a href='https://etsy.com/shop/KDYards' rel='noreferrer' target='_blank'>KDYards</a>
                    </Field.Row>
                </Field.Group>
                </div>
                <div className='options'>
                    <button className='good'>
                        Load
                        <input type='file' onChange={(e) => {
                            handleUpload(e.target, e.target.files[0] ?? null, dispatch);
                        }} accept=".json" />
                    </button>
                    <button className='good' disabled={state.layers.length === 0} onClick={() => {
                        const b = new Blob([JSON.stringify(state)], { type: "application/json;charset=utf-8"});
                        saveAs(b, `${state.name === "" ? "MagicCircle" : state.name}.json`)
                    }}>Save</button>
                    <button className='good' disabled={state.layers.length === 0} onClick={() => { setModal('export') }}>Export</button>
                    <button className='bad' disabled={state.layers.length === 0} onClick={() => {
                        dispatch({ action: "load", value: _.cloneDeep(initialState) })
                    }}>Clear</button>
                </div>
                <div className='controls'>
                    <Field label={"Name"}>
                        <TextInput value={state.name} onChange={(evt) => { dispatch({ action:'edit', path: "name", value: evt.target.value })}} />
                    </Field>
                </div>
                <div className='controls'>
                    <Field.Group label={"Canvas"}>
                        <Prefabs.Length label={"Width"} value={state.dimensions.w} path={['dimensions', 'w']} />
                        <Prefabs.Length label={"Height"} value={state.dimensions.h} path={['dimensions', 'h']} />
                    </Field.Group>
                    <Field.Group label={"Global Colors"}>
                        <Field label={"Foreground"}>
                            <ColorInput value={state.colors.foreground} onChange={(evt) => { dispatch({ action: "edit", path: "colors.foreground", value: evt.target.value })}} />
                        </Field>
                        <Field label={"Background"}>
                            <ColorInput value={state.colors.background} onChange={(evt) => { dispatch({ action: "edit", path: "colors.background", value: evt.target.value })}} withNone />
                        </Field>
                        <Field label={"Canvas"}>
                            <ColorInput value={state.colors.canvas} onChange={(evt) => { dispatch({ action: "edit", path: "colors.canvas", value: evt.target.value })}} />
                        </Field>
                        <Field label={"Viewport"}>
                            <ColorInput value={state.colors.viewport} onChange={(evt) => { dispatch({ action: "edit", path: "colors.viewport", value: evt.target.value })}} />
                        </Field>
                    </Field.Group>
                </div>
                <Field.Heading>Layers</Field.Heading>
                    <CanvasContext.Provider value={state.dimensions}>
                        <ClipboardContext.Provider value={clipboard}>
                            <LayerList.Interface layers={state.layers} path={["layers"]} />
                        </ClipboardContext.Provider>
                    </CanvasContext.Provider>
                </div>
        : null }
        <LogModal isOpen={modal === "changelog"} close={setModal} />
        <ExportModal isOpen={modal === "export"} close={setModal} canvas={state.dimensions} name={state.name} />
    </div>
    </DispatchContext.Provider>
}

export default App;
