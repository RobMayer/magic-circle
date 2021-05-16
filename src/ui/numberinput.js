const NumericInput = ({ wrapperClass, ...props}) => {
    return <div className={`inputwrapper ${wrapperClass}`}>
        <input type='number' {...props} />
    </div>
}
export default NumericInput;
