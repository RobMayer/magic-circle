import Icon from './icon';

const Modal = ({ className, children, isOpen, close, title, stayOpen, disableClose }) => {
    if (!isOpen) { return null; }
    return <div id='modalwrap'>
        <div className={`modal ${className ?? ""}`}>
            <div className='modal_title'>
                <div>{title}</div>
                {!stayOpen ? <button disabled={disableClose ?? false} className={"bad-symbol"} onClick={() => { close() }}><Icon.CLOSE /></button> : null}
            </div>
            <div className='modal_content'>{children}</div>
        </div>
    </div>
}

export default Modal;
