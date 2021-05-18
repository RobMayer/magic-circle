import { createContext } from 'react';

export const DispatchContext = createContext();
export const ClipboardContext = createContext();
export const CanvasContext = createContext();

const output = {
    DispatchContext,
    ClipboardContext,
    CanvasContext
}

export default output;
