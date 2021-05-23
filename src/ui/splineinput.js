import { useContext, useCallback, useMemo, useState } from 'react';
import { DispatchContext } from '../contexts';
import Spline from '../util/spline';
import interpolation from '../util/interpolation';
import Field from './field';
import NumberInput from './numberinput';
import Dropdown from './dropdown';
import Icon from './icon';

// const TEST_GRADIENT = [{ position: 0, value: "#f00" }, { space: "hsl_farthest", curve: "linear" }, { position: 0.5, value: "#f01" }, {}, { position: 1.0, value: "#fc3" }];

const GradientInput = ({ className, value, onUpdate, onDispatch }) => {
    const dispatcher = useContext(DispatchContext);

    const update = useCallback((val, cb) => {
        onUpdate?.(val);
        if (onDispatch && dispatcher) {
            dispatcher({ action: "edit", path: onDispatch, value: val }, cb)
        }
    }, [dispatcher, onDispatch, onUpdate])

    const spline = useMemo(() => {
        return Spline.fromString(value);
    }, [value])

    const insert = useCallback((event) => {
        const box = event.target.getBoundingClientRect();
        const x = (event.pageX - event.target.offsetLeft) / event.target.clientWidth;
        const y = 1  - ((event.pageY - box.top) / box.height);
        const n = spline.insertAt(x, y * spline.getMaxValue());
        update(spline.toString());
        setSelected(n);
    }, [spline, update])

    const remove = useCallback((n) => {
        setSelected(Math.max(0, n - 1));
        const t = spline.removeBy(n);
        update(t.toString())
    }, [spline, update])

    const setValue = useCallback((value, index) => {
        const t = spline.setVertValue(index, value);
        update(t.toString())
    }, [spline, update])

    const setPosition = useCallback((position, index) => {
        const t = spline.setVertPosition(index, position);
        update(t.toString())
    }, [spline, update])

    const setCurve = useCallback((curve, index) => {
        const t = spline.setSegment(index, curve);
        update(t.toString())
    }, [spline, update])

    const [selected, setSelected] = useState(null);

    let splineUI = useMemo(() => {
        if (selected !== null) {
            const count = spline.getLength();
            const color = spline.getVertBy(selected);
            const { left, right } = spline.getSegmentsAround(selected);
            const { min, max } = spline.getVertLimits(selected);
            return <>
                <Field.Row label={"Vertex"} columns={"1fr 1fr min-content"}>
                    <Field label={"Value"}>
                        <NumberInput value={color.value} onUpdate={(v) => { setValue(v, selected)}} min={0} step={0.001} />
                    </Field>
                    <Field label={"Position"}>
                        <NumberInput value={color.position} onUpdate={(v) => { setPosition(v, selected)}} min={min} max={max} step={0.001} />
                    </Field>
                    <Field>
                        <button className='bad-symbol' onClick={() => { remove(selected); }} disabled={count <= 1}><Icon.TRASH /></button>
                    </Field>
                </Field.Row>
                <Field.Row label={"Curve"}>
                    <Field label={"In"}>
                        <Dropdown value={left ?? "linear"} onUpdate={(v) => { setCurve(v, selected - 1) }} disabled={left === null}>
                            {Object.entries(interpolation.CURVE_NAMES).map(([k, v]) => {
                                return <option key={k} value={k}>{v}</option>
                            })}
                        </Dropdown>
                    </Field>
                    <Field label={"Out"}>
                        <Dropdown value={right ?? "linear"} onUpdate={(v) => { setCurve(v, selected) }} disabled={right === null}>
                            {Object.entries(interpolation.CURVE_NAMES).map(([k, v]) => {
                                return <option key={k} value={k}>{v}</option>
                            })}
                        </Dropdown>
                    </Field>
                </Field.Row>
            </>
        } else {
            return <div className='splineinput_noselection'>Select or Add a node to edit the gradient</div>
        }
    }, [selected, spline, setValue, setPosition, remove, setCurve])

    const max = spline.getMaxValue();

    return <div className={`splineinput ${className ?? ""}`}>
        <svg className={`splineinput_canvas`} viewBox={"0 0 1 1"} preserveAspectRatio="none">
            <path className={`splineinput_line`} d={spline.toSvg()} />
        </svg>
        <div className={`splineinput_selector`} onClick={insert}>
        {
            spline.getVerts().map((c, i) => {
                return <div key={i} className={`splineinput_vert ${selected === i ? "state-selected" : ""}`} style={{ bottom: `calc(${c.value / max * 100}% - 0.5em)`, left: `calc(${c.position * 100}% - 0.5em)` }} onClick={(e) => { setSelected(i === selected ? null : i); e.stopPropagation() }}><Icon.DOT /></div>
            })
        }
        </div>
        <div className={`splineinput_fields`}>
        {splineUI}
        </div>
    </div>
}

export default GradientInput;
