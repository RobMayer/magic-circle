import { useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';

const UnitDropdown = ({ children, value, wrapperClass, onChange, onUpdate, onDispatch, ...props }) => {

    const dispatcher = useContext(DispatchContext);

    const update = useCallback((evt) => {
        onChange?.(evt.target.checked)
        onUpdate?.(evt.target.checked)
        if (onDispatch && dispatcher) {
            dispatcher({ action: "edit", value: evt.target.value, path: onDispatch })
        }
    }, [onUpdate, onChange, onDispatch, dispatcher])

    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <select {...props} value={value} onChange={update}>
            <option value={1}>pt</option>
            <option value={96}>in</option>
            <option value={96 / 25.4}>mm</option>
            <option value={96 / 2.54}>cm</option>
        </select>
    </div>
}

export default UnitDropdown;
