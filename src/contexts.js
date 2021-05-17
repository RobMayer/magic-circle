import { createContext } from 'react';

export const DispatchContext = createContext();
export const ClipboardContext = createContext();
export const ColorContext = createContext();
export const CanvasContext = createContext();

const output = {
    DispatchContext,
    ClipboardContext,
    ColorContext,
    CanvasContext
}

export default output;
