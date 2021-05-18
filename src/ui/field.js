import { useState } from 'react';
import Icon from './icon';

const Field = ({ label, className, children, tooltip, columns, inlineLabel }) => {
    return <div className={`field ${className ?? ""} ${label ? inlineLabel ? 'with-inline-label' : 'with-label' : '' }`} title={tooltip}>
        { label ? <div className='field_label'>{label}</div> : null }
        <div className='field_content' style={{ gridAutoColumns: columns ?? "1fr" }}>{children}</div>
    </div>
}
Field.defaultProps = {
    className: ""
}

const Group = ({ label, className, children, tooltip, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return <div className={`group ${className ?? ""}`}>
        <div onClick={(e) => { setIsOpen(!isOpen) }} className='group_label' title={tooltip}>{isOpen ? <Icon.ARROW_S /> : <Icon.ARROW_E />} {label}</div>
        { !isOpen || <div className='group_content'>{children}</div> }
    </div>
}

const Heading = ({ children }) => {
    return <div className={`heading`}>{children}</div>
}

const SubHeading = ({ children }) => {
    return <div className={`subheading`}>{children}</div>
}

const Row = ({ children, label, className, tooltip }) => {
    return <div className={`row ${className ?? ""} ${label ? 'with-label' : '' }`} title={tooltip}>
        { label ? <div className='row_label'>{label}</div> : null }
        {children}
    </div>
}

Field.Heading = Heading;
Field.Group = Group;
Field.SubHeading = SubHeading;
Field.Row = Row;

export default Field;
