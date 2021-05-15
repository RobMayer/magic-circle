import Line from './line';
import Circle from './circle';
import Ring from './ring';
import Polygon from './polygon';
import Polygram from './polygram';
import Burst from './burst';
import Arc from './arc';
import RadialAry from './radialary';
import VertexAry from './vertexary';
import Mask from './mask';
import Note from './note';
import Group from './group';

export const Drawing = ({ path, ...layer }) => {
    switch (layer.type) {
        case "line": return <Line.Drawing {...layer} path={path} />;
        case "circle": return <Circle.Drawing {...layer} path={path} />;
        case "ring": return <Ring.Drawing {...layer} path={path} />;
        case "polygon": return <Polygon.Drawing {...layer} path={path} />;
        case "polygram": return <Polygram.Drawing {...layer} path={path} />;
        case "burst": return <Burst.Drawing {...layer} path={path} />;
        case "arc": return <Arc.Drawing {...layer} path={path} />;
        case "vertexary": return <VertexAry.Drawing path={path} {...layer} />;
        case "radialary": return <RadialAry.Drawing {...layer} path={path} />;
        case "mask": return <Mask.Drawing {...layer} path={path} />;
        case "group": return <Group.Drawing {...layer} path={path} />;
        default: return null;
    }
}

export const Interface = ({ path, fromMask, ...layer }) => {
    switch (layer.type) {
        case "line": return <Line.Interface layer={layer} path={path} fromMask={fromMask} />
        case "circle": return <Circle.Interface layer={layer} path={path} fromMask={fromMask} />
        case "ring": return <Ring.Interface layer={layer} path={path} fromMask={fromMask} />
        case "polygon": return <Polygon.Interface layer={layer} path={path} fromMask={fromMask} />
        case "polygram": return <Polygram.Interface layer={layer} path={path} fromMask={fromMask} />
        case "burst": return <Burst.Interface layer={layer} path={path} fromMask={fromMask} />
        case "arc": return <Arc.Interface layer={layer} path={path} fromMask={fromMask} />
        case "vertexary": return <VertexAry.Interface layer={layer} path={path} fromMask={fromMask} />
        case "radialary": return <RadialAry.Interface layer={layer} path={path} fromMask={fromMask} />
        case "mask": return <Mask.Interface layer={layer} path={path} fromMask={fromMask} />
        case "group": return <Group.Interface layer={layer} path={path} fromMask={fromMask} />
        case "note": return <Note.Interface layer={layer} path={path} />
        default: return null;
    }
}

const output = {
    Drawing,
    Interface
}

export default output;
