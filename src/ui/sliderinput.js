import { useEffect, useState, useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';

const SliderInput = ({ wrapperClass, value, onUpdate, onChange, onDispatch, onBlur, ...props}) => {
    const [state, setState] = useState(value);

    const dispatcher = useContext(DispatchContext);

    useEffect(() => {
        setState(value)
    }, [value])

    const revert = useCallback((e) => {
        if (!e.target.validity.valid) {
            setState(value)
        }
        onBlur?.(e)
    }, [value, onBlur])

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
        <input {...props} type='range' value={state} onChange={update} onBlur={revert} />
    </div>
}
export default SliderInput;
