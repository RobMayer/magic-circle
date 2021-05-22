import { Children, useCallback, useContext } from 'react';
import { DispatchContext } from '../contexts';

const Option = ({ children }) => {
    return <>{children}</>
}

const Tabs = ({ value, onSelect, onDispatch, children }) => {
    const dispatcher = useContext(DispatchContext);
    const onClick = useCallback((value) => {
        onSelect?.(value);
        if (onDispatch && dispatcher) {
            dispatcher?.({ path: onDispatch, action: "edit", value })
        }
    }, [onSelect, onDispatch, dispatcher])

    let nC = null;
    const labels = [];
    Children.forEach(children, (child, i) => {
        if (child.type === Option) {
            labels.push(<button disabled={child.props.disabled ?? false} className={`tabs_option ${child.props.value === value ? "option-active" : "option-passive"}`} key={child.key ?? i} onClick={() => { onClick(child.props.value) }}>{child.props.label}</button>);
            if (child.props.value === value) {
                nC = child;
            }
        }
    })
    return <div className="tabs">
        <div className={'tabs_menu'}>{labels}</div>
        <div className={'tabs_content'}>{nC}</div>
    </div>
}

Tabs.Option = Option;

export default Tabs;
