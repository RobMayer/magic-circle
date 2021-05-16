const SliderInput = ({ wrapperClass, ...props}) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input type='range' {...props} />
    </div>
}
export default SliderInput;
