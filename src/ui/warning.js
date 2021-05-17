const Warning = ({ className, title, children }) => {
    return <div className={`warning ${className ?? ""}`}>
        <div className={"warning_label"}>{title ?? "Warning"}</div>
        <div className={"warning_content"}>{children}</div>
    </div>
}
export default Warning;
