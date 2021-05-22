import { useEffect, useState, useCallback } from 'react';

const SliderInput = ({ wrapperClass, value, onUpdate, onChange, onDispatch, onBlur, path, ...props}) => {
    const [state, setState] = useState(value);

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
            if (onDispatch && path) {
                onDispatch({ action: "edit", value: e.target.value, path })
            }
        }
    }, [onUpdate, onChange, onDispatch, path])

    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input {...props} type='range' value={state} onChange={update} onBlur={revert} />
    </div>
}
export default SliderInput;
