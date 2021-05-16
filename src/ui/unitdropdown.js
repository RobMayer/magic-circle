const UnitDropdown = ({ wrapperClass, ...props }) => {
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
    <select {...props}>
        <option value={1}>pt</option>
        <option value={96}>in</option>
        <option value={96 / 25.4}>mm</option>
        <option value={96 / 2.54}>cm</option>
    </select>
</div>
}

export default UnitDropdown;

