import Field from './field';
import NumberInput from './numberinput';
import UnitDropdown from './unitdropdown';
import ColorInput from './colorinput';
import Dropdown from './dropdown';
import Checkbox from './checkbox';
import Tabs from './tabs';

export const Length = ({ value, path, label, tooltip, valueField = "value", unitField = "unit", scaleField = "useScale", min, withScale }) => {
    return <Field label={label} tooltip={tooltip} columns={`2.5fr 1fr ${withScale ? "min-content" : ""}`}>
        <NumberInput value={value[valueField]} onDispatch={[...path, valueField]} step={0.001} min={min} />
        <UnitDropdown value={value[unitField]} onDispatch={[...path, unitField]} />
        { withScale ?  <Checkbox value={value[scaleField]} onDispatch={[...path, scaleField]} title={"Use Parent's Scale Factor"} /> : null }
    </Field>
}

export const Transforms = ({ layer, path, withRotation, withScale }) => {
    return <Field.Group label={withRotation && withScale ? "Transforms" : withScale ? "Position & Scale" : withRotation ? "Position & Rotation" : "Position"}>
        <Tabs value={layer.posMode} onDispatch={[...path, 'posMode']}>
            <Tabs.Option value={"polar"} label={"Polar"}>
                <Field.Row>
                    <Length label={"Distance"} value={layer.r} path={[...path, 'r']} />
                    <Field label={"Angle"}>
                        <NumberInput value={layer.t} onDispatch={[...path, 't']} step={0.001} />
                    </Field>
                </Field.Row>
            </Tabs.Option>
            <Tabs.Option value={"cartesian"} label={"Cartesian"}>
                <Field.Row>
                    <Length label={"X Position"} value={layer.x} path={[...path, 'x']} />
                    <Length label={"Y Position"} value={layer.y} path={[...path, 'y']} />
                </Field.Row>
            </Tabs.Option>
        </Tabs>
        { withRotation ?
            <Field label={"Rotation"}>
                <NumberInput value={layer.rotation} onDispatch={[...path, 'rotation']} step={0.001} />
            </Field>
        : null}
        { withScale ?
            <Field label={"Scale"}>
                <NumberInput value={layer.s} onDispatch={[...path, 's']} step={0.001} />
            </Field>
        : null}
    </Field.Group>
}

export const Appearance = ({ layer, path, dispatch, withStroke, withFill, fromMask }) => {
    if (withFill || withStroke) {
        return <Field.Group label={"Appearance"}>
            {withFill ?
                <Field label={"Fill Color"} columns={"2fr 1fr"}>
                    <Dropdown value={layer.fill.option} onDispatch={[...path, 'fill', 'option']}>
                        <option value='none'>None</option>
                        <option value='foreground'>{fromMask ? "Reveal" : "Foreground"}</option>
                        <option value='background'>{fromMask ? "Hide" : "Background"}</option>
                        <option value='custom'>Custom</option>
                        <option value='tween'>Interpolated</option>
                    </Dropdown>
                    <ColorInput value={layer.fill.color} onDispatch={[...path, 'fill', 'color']} disabled={layer.fill.option !== "custom"} />
                </Field>
            : null }
            {withStroke ?
                <Field label={"Stroke Color"} columns={"2fr 1fr"}>
                    <Dropdown value={layer.stroke.option} onDispatch={[...path, 'stroke', 'option']}>
                        <option value='none'>None</option>
                        <option value='foreground'>{fromMask ? "Reveal" : "Foreground"}</option>
                        <option value='background'>{fromMask ? "Hide" : "Background"}</option>
                        <option value='custom'>Custom</option>
                        <option value='tween'>Interpolated</option>
                    </Dropdown>
                    <ColorInput value={layer.stroke.color} onDispatch={[...path, 'stroke', 'color']} disabled={layer.stroke.option !== "custom"} />
                </Field>
            : null }
            {withStroke ?
                <Length label={"Stroke Width"} value={layer.stroke} path={[...path, 'stroke']} withScale />
            : null }
        </Field.Group>
    }
    return null;
}



const output = {
    Transforms,
    Appearance,
    Length
}

export default output;
