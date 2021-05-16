const COLOR_REGEX = "#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})";

const ColorInput = ({ wrapperClass, withNone, ...props}) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input type={'text'} {...props} pattern={`^${withNone ? `(none|${COLOR_REGEX})` : COLOR_REGEX}$`} />
    </div>
}
export default ColorInput;
