import { useLayoutEffect, useRef } from "react";
import ResizeObserver from "resize-observer-polyfill";

const useResizeObserver = (callback) => {
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        let RO = new ResizeObserver((entries) => {
            if (!Array.isArray(entries)) { return; }
            const entry = entries[0];
            callback(entry, entry.contentRect)
        });
        RO.observe(ref.current);
        return () => {
            RO.disconnect();
            RO = null;
        };
    }, [callback, ref]);

    return ref;
}

export default useResizeObserver;
