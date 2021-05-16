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

const version = "0.1.2";

const handleUpload = (file, dispatch) => {
    if (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                const value = validateUpload(json, "");
                console.dir(value);
                if (value) {
                    dispatch({ action: "load", value })
                } else {
                    console.error("problem parsing uploaded file");
                }
            } catch (e) {
                console.error("problem parsing json");
            }
        }
        reader.onerror = (evt) => {
            console.error("problem reading file");
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

    const cw = state.dimensions.w.value * state.dimensions.w.unit;
    const ch = state.dimensions.h.value * state.dimensions.h.unit;

    const rH = cw / ch * 100; // 16/9
    const rW = ch / cw * 100;

    return <div id="app">
        <div id="viewport" style={{ backgroundColor: state.colors.viewport }}>
            <CanvasContext.Provider value={state.colors}>
                <div id="canvas" style={{ maxWidth: `${rH}vh`, height:`${rW}vw` }}>
                    <svg id="export" viewBox={`${cw / -2} ${ch / -2} ${cw} ${ch}`} style={{ backgroundColor: state.colors.canvas }}>
                        <LayerList.Drawing layers={state.layers} path="layers" />
                    </svg>
                </div>
            </CanvasContext.Provider>
        </div>
        <div id='toggle'>
            <button onClick={() => { setIsOpen(!isOpen) }}>{isOpen ? "\u25BA" : "\u25C4"}</button>
        </div>
        {isOpen ?
            <div id="controlpanel">
                <Field.Heading>Arcanigen</Field.Heading>
                <div className='controls'>
                <Field.Group label={"About"}>
                    <Field label={"Version"}><code>{version}</code></Field>
                    <Field label={"Twitter"}><a href='https://twitter.com/ThatRobHuman' rel='noreferrer' target='_blank'>@ThatRobHuman</a></Field>
                    <Field label={"Instagram"}><a href='https://www.instagram.com/thatrobhuman/' rel='noreferrer' target='_blank'>ThatRobHuman</a></Field>
                    <Field label={"Etsy"}><a href='https://etsy.com/shop/KDYards' rel='noreferrer' target='_blank'>KDYards</a></Field>
                </Field.Group>
                </div>
                <div className='options'>
                    <button className='good'>
                        Load
                        <input type='file' onChange={(e) => {
                            handleUpload(e.target.files[0] ?? null, dispatch);
                        }} accept=".json" />
                    </button>
                    <button className='good' disabled={state.layers.length === 0} onClick={() => {
                        const b = new Blob([JSON.stringify(state)], { type: "application/json;charset=utf-8"});
                        saveAs(b, `${state.name === "" ? "MagicCircle" : state.name}.json`)
                    }}>Save</button>
                    <button className='good' disabled={state.layers.length === 0} onClick={() => {
                        const content = document.getElementById("export").innerHTML;
                        const b = new Blob([`<svg viewBox="${cw / -2} ${ch / -2} ${cw} ${ch}" xmlns="http://www.w3.org/2000/svg" xmlnsXlink= "http://www.w3.org/1999/xlink">${content}</svg>`], { type: "image/svg+xml;charset=utf-8"});
                        saveAs(b, `${state.name === "" ? "MagicCircle" : state.name}.svg`)
                    }}>Export SVG</button>
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
                        <Prefabs.Length label={"Width"} value={state.dimensions.w} path={`dimensions.w`} dispatch={dispatch} />
                        <Prefabs.Length label={"Height"} value={state.dimensions.h} path={`dimensions.h`} dispatch={dispatch} />
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
                <DispatchContext.Provider value={dispatch}>
                    <ClipboardContext.Provider value={clipboard}>
                        <LayerList.Interface layers={state.layers} path="layers" />
                    </ClipboardContext.Provider>
                </DispatchContext.Provider>
            </div>
        : null }
    </div>
}

export default App;
