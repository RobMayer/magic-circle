import { useState, useReducer } from 'react';
import { set } from 'lodash/fp';
import optimize from 'svgo-browser/lib/optimize';
import Modal from './modal';
import { saveAs } from 'file-saver';
import Field from './field';
import TextInput from './textinput';
import NumberInput from './numberinput';
import Dropdown from './dropdown';
import rasterize from '../util/rasterize';

const reducer = (state, { path, value }) => {
    return set(path, value, state);
}

const START_DIMENSIONS = { width: { value: 5, unit: 96 }, height: { value: 5, unit: 96 }, dpi: { value: 96, unit: 96 }};

export const ExportModal = ({ isOpen, close, canvas, name }) => {

    const cw = canvas.w.value * canvas.w.unit;
    const ch = canvas.h.value * canvas.h.unit;
    const [filename, setFilename] = useState(name);
    const [ dimensions, dispatch ] = useReducer(reducer, START_DIMENSIONS);

    const [ processing, setProcessing ] = useState(false);

    return <Modal title={"Export"} isOpen={isOpen} close={close} disableClose={processing}>
        <Field label={"Filename"}>
            <TextInput value={filename} onChange={(e) => { setFilename(e.target.value )}} />
        </Field>
        <Field.Row>
            <Field label={"Width"} columns={"2fr 1fr"}>
                <NumberInput value={dimensions.width.value} onChange={(e) => { dispatch({ path: "width.value", value: e.target.value }) }} />
                <Dropdown value={dimensions.width.unit} onChange={(e) => { dispatch({ path: "width.unit", value: e.target.value }) }} >
                    <option value={96}>in</option>
                    <option value={96 / 25.4}>mm</option>
                    <option value={96 / 2.54}>cm</option>
                </Dropdown>
            </Field>
            <Field label={"Height"} columns={"2fr 1fr"}>
                <NumberInput value={dimensions.height.value} onChange={(e) => { dispatch({ path: "height.value", value: e.target.value }) }} />
                <Dropdown value={dimensions.height.unit} onChange={(e) => { dispatch({ path: "height.unit", value: e.target.value }) }} >
                    <option value={96}>in</option>
                    <option value={96 / 25.4}>mm</option>
                    <option value={96 / 2.54}>cm</option>
                </Dropdown>
            </Field>
            <Field label={"Resolution"} columns={"2fr 1fr"}>
                <NumberInput value={dimensions.dpi.value} onChange={(e) => { dispatch({ path: "dpi.value", value: e.target.value }) }} />
                <Dropdown value={dimensions.dpi.unit} onChange={(e) => { dispatch({ path: "dpi.unit", value: e.target.value }) }} >
                    <option value={96}>in</option>
                    <option value={96 / 25.4}>mm</option>
                    <option value={96 / 2.54}>cm</option>
                </Dropdown>
            </Field>
        </Field.Row>
        <Field>
            <button className='good' disabled={processing} onClick={() => {
                const content = document.getElementById("export").innerHTML;
                const svgData = `<svg viewBox="${cw / -2} ${ch / -2} ${cw} ${ch}" width="${cw}" height="${ch}" xmlns="http://www.w3.org/2000/svg" xmlnsXlink= "http://www.w3.org/1999/xlink">${content}</svg>`;
                setProcessing(true);
                optimize(svgData).then((res) => {
                    const b = new Blob([res], { type: "image/svg+xml;charset=utf-8"});
                    saveAs(b, `${filename}.svg`)
                    setProcessing(false);
                }).catch((e) => {
                    console.error(e);
                    setProcessing(false);
                })
            }}>Export as SVG</button>
            <button className='good' disabled={processing} onClick={() => {
                const content = document.getElementById("export").innerHTML;
                const width = Math.round(dimensions.width.value * dimensions.width.unit * (dimensions.dpi.value / dimensions.dpi.unit));
                const height = Math.round(dimensions.height.value * dimensions.height.unit * (dimensions.dpi.value / dimensions.dpi.unit));
                const svgData = `<svg viewBox="${cw / -2} ${ch / -2} ${cw} ${ch}" xmlns="http://www.w3.org/2000/svg" xmlnsXlink= "http://www.w3.org/1999/xlink">${content}</svg>`;
                setProcessing(true);
                optimize(svgData).then((res) => {
                    return rasterize(res, width, height);
                }).then((res) => {
                    saveAs(res, `${filename}.png`);
                    setProcessing(false);
                }).catch((e) => {
                    console.error(e);
                    setProcessing(false);
                })
            }}>Export as PNG</button>
        </Field>
    </Modal>
}

export default ExportModal;
