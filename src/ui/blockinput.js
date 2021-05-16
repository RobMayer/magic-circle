const BlockInput = ({ wrapperClass, ...props }) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <textarea {...props} />
    </div>
}
export default BlockInput;
