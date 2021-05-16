const TextInput = ({ wrapperClass, ...props}) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input type={'text'} {...props} />
    </div>
}
export default TextInput;
