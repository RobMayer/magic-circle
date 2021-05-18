import changelog from '../changelog';
import Modal from './modal';

export const LogModal = ({ isOpen, close }) => {
    return <Modal title={"Changelog"} className={'changelog'} isOpen={isOpen} close={close}>
        {changelog.map(({ version, items }) => {
            return <div className={'changelog_entry'} key={version}>
                <div className={'changelog_version'}>{version}</div>
                <ul className={'changelog_item'}>
                    {items.map((item, i) => {
                        return <li key={i}>{item}</li>
                    })}
                </ul>
            </div>
        })}
    </Modal>
}

export default LogModal;
