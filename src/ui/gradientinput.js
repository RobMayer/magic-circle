import { useContext, useCallback, useRef, useMemo, useState } from 'react';
import { DispatchContext } from '../contexts';
import useResizeObserver from '../util/useresizeobserver';
import Gradient from '../util/gradient';
import interpolation from '../util/interpolation';
import Field from './field';
import ColorInput from './colorinput';
import NumberInput from './numberinput';
import Dropdown from './dropdown';
import Icon from './icon';

// const TEST_GRADIENT = [{ position: 0, value: "#f00" }, { space: "hsl_farthest", curve: "linear" }, { position: 0.5, value: "#f01" }, {}, { position: 1.0, value: "#fc3" }];

const GradientInput = ({ className, value, onUpdate, onDispatch }) => {
    const dispatcher = useContext(DispatchContext);
    const gradientRef = useRef();

    const update = useCallback((val, cb) => {
        onUpdate?.(val);
        if (onDispatch && dispatcher) {
            dispatcher({ action: "edit", path: onDispatch, value: val }, cb)
        }
    }, [dispatcher, onDispatch, onUpdate])

    const gradient = useMemo(() => {
        return Gradient.fromString(value);
    }, [value])

    const onResize = useCallback((element, box) => {
        if (!gradientRef?.current) { return }
        const canvas = gradientRef.current;
        canvas.width = box.width;
        const ctx = canvas.getContext('2d');
        const g = Gradient.fromString(value);
        if (g) {
            for (let x = 0; x < canvas.width; x++) {
                ctx.fillStyle = g.getColorAt(x / canvas.width);
                ctx.fillRect(x, 0, 1, 1);
            }
        }
    }, [value]);
    const parent = useResizeObserver(onResize);

    const insert = useCallback((event) => {
        const x = (event.pageX - event.target.offsetLeft) / event.target.width;
        const n = gradient.insertAt(x);
        update(gradient.toString());
        setSelected(n);
    }, [gradient, update])

    const remove = useCallback((n) => {
        setSelected(Math.max(0, n - 1));
        const t = gradient.removeBy(n);
        update(t.toString())
    }, [gradient, update])

    const setColor = useCallback((value, index) => {
        const t = gradient.setColorValue(index, value);
        update(t.toString())
    }, [gradient, update])

    const setPosition = useCallback((position, index) => {
        const t = gradient.setColorPosition(index, position);
        update(t.toString())
    }, [gradient, update])

    const setCurve = useCallback((curve, index) => {
        update(gradient.setSegmentCurve(index, curve).toString())
    }, [gradient, update])

    const setSpace = useCallback((space, index) => {
        update(gradient.setSegmentSpace(index, space).toString())
    }, [gradient, update])

    const [selected, setSelected] = useState(null);

    let gradientUI = useMemo(() => {
        if (selected !== null) {
            const count = gradient.getLength();
            const color = gradient.getColorBy(selected);
            const { left, right } = gradient.getSegmentsAround(selected);
            const { min, max } = gradient.getColorLimits(selected);
            return <>
                <Field.Row label={"Color"} columns={"1fr 1fr min-content"}>
                    <Field label={"Value"}>
                        <ColorInput value={color.value} onUpdate={(v) => { setColor(v, selected)}} />
                    </Field>
                    <Field label={"Position"}>
                        <NumberInput value={color.position} onUpdate={(v) => { setPosition(v, selected)}} min={min} max={max} step={0.001} />
                    </Field>
                    <Field>
                        <button className='bad-symbol' onClick={() => { remove(selected); }} disabled={count <= 1}><Icon.TRASH /></button>
                    </Field>
                </Field.Row>
                <Field.Row label={"Fade In"}>
                    <Field label={"Colorspace"}>
                        <Dropdown value={left?.space ?? "rgb"} onUpdate={(v) => { setSpace(v, selected - 1) }} disabled={(left?.space ?? null) === null}>
                            {Object.entries(interpolation.COLORSPACE_NAMES).map(([k, v]) => {
                                return <option key={k} value={k}>{v}</option>
                            })}
                        </Dropdown>
                    </Field>
                    <Field label={"Distribution"}>
                        <Dropdown value={left?.curve ?? "linear"} onUpdate={(v) => { setCurve(v, selected - 1) }} disabled={(left?.curve ?? null) === null}>
                            {Object.entries(interpolation.CURVE_NAMES).map(([k, v]) => {
                                return <option key={k} value={k}>{v}</option>
                            })}
                        </Dropdown>
                    </Field>
                </Field.Row>
                <Field.Row label={"Fade Out"}>
                    <Field label={"Colorspace"}>
                        <Dropdown value={right?.space ?? "rgb"} onUpdate={(v) => { setSpace(v, selected) }} disabled={(right?.space ?? null) === null}>
                            {Object.entries(interpolation.COLORSPACE_NAMES).map(([k, v]) => {
                                return <option key={k} value={k}>{v}</option>
                            })}
                        </Dropdown>
                    </Field>
                    <Field label={"Distribution"}>
                        <Dropdown value={right?.curve ?? "linear"} onUpdate={(v) => { setCurve(v, selected) }} disabled={(right?.curve ?? null) === null}>
                            {Object.entries(interpolation.CURVE_NAMES).map(([k, v]) => {
                                return <option key={k} value={k}>{v}</option>
                            })}
                        </Dropdown>
                    </Field>
                </Field.Row>
            </>
        } else {
            return <div className='gradientinput_noselection'>Select or Add a node to edit the gradient</div>
        }
    }, [gradient, remove, selected, setColor, setCurve, setPosition, setSpace])

    return <div ref={parent} className={`gradientinput ${className ?? ""}`}>
        <canvas className={`gradientinput_canvas`} ref={gradientRef} height="1" onClick={insert} />
        <div className={`gradientinput_selector`} onClick={(e) => { setSelected(null); }}>
        {
            gradient.getColors().map((c, i) => {
                return <div key={i} className={`gradientinput_color ${selected === i ? "state-selected" : ""}`} style={{ left: `calc(${c.position * 100}% - 0.5em)` }} onClick={(e) => { setSelected(i); e.stopPropagation() }}><Icon.ARROW_N /></div>
            })
        }
        </div>
        <div className={`gradientinput_fields`}>
        {gradientUI}
        </div>
    </div>
}

export default GradientInput;
