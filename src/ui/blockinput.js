import { useEffect, useState, useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';

const BlockInput = ({ wrapperClass, value, onUpdate, onChange, onDispatch, onBlur, ...props }) => {
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

    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <textarea {...props} value={state} onChange={update} onBlur={revert} />
    </div>
}
export default BlockInput;
