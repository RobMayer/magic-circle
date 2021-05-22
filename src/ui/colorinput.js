import { useMemo, useEffect, useState, useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';
const COLOR_REGEX = "#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})";

const ColorInput = ({ wrapperClass, value, onUpdate, onChange, onDispatch, withNone, nullable, onBlur, ...props}) => {
    const dispatcher = useContext(DispatchContext);
    const [state, setState] = useState(value);

    const revert = useCallback((e) => {
        if (!e.target.validity.valid) {
            setState(value)
        }
        onBlur?.(e)
    }, [value, onBlur])

    useEffect(() => {
        setState(value)
    }, [value])

    const update = useCallback((e) => {
        setState(e.target.value);
        if (e.target.validity.valid) {
            onUpdate?.(e.target.value);
            onChange?.(e);
            if (onDispatch && dispatcher) {
                dispatcher({ action: "edit", value: e.target.value, path: onDispatch })
            }
        }
    }, [onUpdate, onChange, onDispatch, dispatcher])

    const regex = useMemo(() => {
        const r = [`^${COLOR_REGEX}$`];
        if (nullable) { r.push('^$'); }
        if (withNone) { r.push('^none$'); }
        return r.join("|");
    }, [withNone, nullable])

    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input {...props} value={state} onChange={update} type={'text'} onBlur={revert} pattern={regex} />
    </div>
}
export default ColorInput;
