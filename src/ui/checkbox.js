const Checkbox = ({ value, onChange, ...props}) => {
    return <div className={`inputwrapper`}>
        <input {...props} type={'checkbox'} value={value} checked={value} onChange={(evt) => {
            onChange?.(evt.target.checked)
        }} />
    </div>
}
export default Checkbox;
