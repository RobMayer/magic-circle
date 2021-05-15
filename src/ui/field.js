import { useState } from 'react';

const Field = ({ label, className, children, tooltip, columns }) => {
    return <div className={`field ${className} ${label ? 'with-label' : '' }`} title={tooltip}>
        { label ? <div className='field_label'>{label}</div> : null }
        <div className='field_content' style={{ gridAutoColumns: columns ?? "1fr" }}>{children}</div>
    </div>
}
Field.defaultProps = {
    className: ""
}

const Group = ({ label, className, children, tooltip, startOpen }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return <div className={`group ${className}`}>
        <div onClick={(e) => { setIsOpen(!isOpen) }} className='group_label' title={tooltip}> {isOpen ? "\u25BC" : "\u25BA"} {label}</div>
        { !isOpen || <div className='group_content'>{children}</div> }
    </div>
}
Group.defaultProps = {
    className: "",
    startOpen: false
}

const Heading = ({ children }) => {
    return <div className={`heading`}>{children}</div>
}

const SubHeading = ({ children }) => {
    return <div className={`subheading`}>{children}</div>
}

Field.Heading = Heading;
Field.Group = Group;
Field.SubHeading = SubHeading;

export default Field;
