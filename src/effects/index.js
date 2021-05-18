import Sketch from './sketch';
import Pencil from './pencil';
import Pen from './pen';
import Glow from './glow';

export const Drawing = ({ path, ...definition }) => {
    switch (definition.type) {
        case "sketch": return <Sketch.Drawing {...definition} path={path} />;
        case "pencil": return <Pencil.Drawing {...definition} path={path} />;
        case "pen": return <Pen.Drawing {...definition} path={path} />;
        case "glow": return <Glow.Drawing {...definition} path={path} />;
        default: return null;
    }
}

export const Interface = ({ path, definition }) => {
    switch (definition.type) {
        case "sketch": return <Sketch.Interface definition={definition} path={path} />
        case "pencil": return <Pencil.Interface definition={definition} path={path} />
        case "pen": return <Pen.Interface definition={definition} path={path} />
        case "glow": return <Glow.Interface definition={definition} path={path} />
        default: return null;
    }
}

const output = {
    Drawing,
    Interface
}

export default output;
