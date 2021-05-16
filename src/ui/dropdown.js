const Dropdown = ({ children, wrapperClass, ...props }) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <select {...props}>
            {children}
        </select>
    </div>
}

export default Dropdown;
