import { useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';

const Dropdown = ({ children, value, wrapperClass, onChange, onUpdate, onDispatch, ...props }) => {

    const dispatcher = useContext(DispatchContext);

    const update = useCallback((evt) => {
        onChange?.(evt)
        onUpdate?.(evt.target.value)
        if (onDispatch && dispatcher) {
            dispatcher({ action: "edit", value: evt.target.value, path: onDispatch })
        }
    }, [onUpdate, onChange, onDispatch, dispatcher])

    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <select {...props} value={value} onChange={update}>
            {children}
        </select>
    </div>
}

export default Dropdown;
