const Checkbox = ({ value, onChange, wrapperClass, ...props}) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input {...props} type={'checkbox'} value={value} checked={value} onChange={(evt) => {
            onChange?.(evt.target.checked)
        }} />
    </div>
}
export default Checkbox;
