import { useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';

const Checkbox = ({ value, onUpdate, onChange, onDispatch, wrapperClass, label, ...props}) => {

    const dispatcher = useContext(DispatchContext);

    const update = useCallback((evt) => {
        onChange?.(evt.target.checked)
        onUpdate?.(evt.target.checked)
        if (onDispatch && dispatcher) {
            dispatcher({ action: "edit", value: evt.target.checked, path: onDispatch })
        }
    }, [onChange, onUpdate, onDispatch, dispatcher])

    return <div className={`inputwrapper checkbox ${wrapperClass ?? ""}`}>
        <input {...props} type={'checkbox'} value={value} checked={value} onChange={update} />
        { label ? <div className={'checkbox_label'}>{label}</div> : null }
    </div>
}
export default Checkbox;
