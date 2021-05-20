import { useMemo } from 'react';
const COLOR_REGEX = "#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})";

const ColorInput = ({ wrapperClass, withNone, nullable, ...props}) => {
    const regex = useMemo(() => {
        const r = [`^${COLOR_REGEX}$`];
        if (nullable) { r.push('^$'); }
        if (withNone) { r.push('^none$'); }
        return r.join("|");
    }, [withNone, nullable])
    return <div className={`inputwrapper ${wrapperClass ?? ""}`}>
        <input type={'text'} {...props} pattern={regex} />
    </div>
}
export default ColorInput;
