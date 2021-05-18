import Field from './field';
import NumberInput from './numberinput';
import UnitDropdown from './unitdropdown';
import ColorInput from './colorinput';
import Dropdown from './dropdown';
import Checkbox from './checkbox';
import Tabs from './tabs';
import { onChange, onValue } from './common';

export const Length = ({ value, path, dispatch, label, tooltip, valueField = "value", unitField = "unit", scaleField = "useScale", min, withScale }) => {
    return <Field label={label} tooltip={tooltip} columns={`2.5fr 1fr ${withScale ? "min-content" : ""}`}>
        <NumberInput value={value[valueField]} onChange={onChange(dispatch, [...path, valueField])} step={0.001} min={min} />
        <UnitDropdown value={value[unitField]} onChange={onChange(dispatch, [...path, unitField])} />
        { withScale ?  <Checkbox value={value[scaleField]} onChange={onValue(dispatch, [...path, scaleField])} title={"Use Parent's Scale Factor"} /> : null }
    </Field>
}

export const Transforms = ({ layer, path, dispatch, withRotation, withScale }) => {
    return <Field.Group label={withRotation && withScale ? "Transforms" : withScale ? "Position & Scale" : withRotation ? "Position & Rotation" : "Position"}>
        <Tabs value={layer.posMode} onChange={onValue(dispatch, [...path, 'posMode'])}>
            <Tabs.Option value={"polar"} label={"Polar"}>
                <Field.Row>
                    <Length label={"Distance"} dispatch={dispatch} value={layer.r} path={[...path, 'r']} />
                    <Field label={"Angle"}>
                        <NumberInput value={layer.t} onChange={onChange(dispatch, [...path, 't'])} step={0.001} />
                    </Field>
                </Field.Row>
            </Tabs.Option>
            <Tabs.Option value={"cartesian"} label={"Cartesian"}>
                <Field.Row>
                    <Length label={"X Position"} dispatch={dispatch} value={layer.x} path={[...path, 'x']} />
                    <Length label={"Y Position"} dispatch={dispatch} value={layer.y} path={[...path, 'y']} />
                </Field.Row>
            </Tabs.Option>
        </Tabs>
        { withRotation ?
            <Field label={"Rotation"}>
                <NumberInput value={layer.rotation} onChange={onChange(dispatch, [...path, 'rotation'])} step={0.001} />
            </Field>
        : null}
        { withScale ?
            <Field label={"Scale"}>
                <NumberInput value={layer.s} onChange={onChange(dispatch, [...path, 's'])} step={0.001} />
            </Field>
        : null}
    </Field.Group>
}

export const Appearance = ({ layer, path, dispatch, withStroke, withFill, fromMask }) => {
    if (withFill || withStroke) {
        return <Field.Group label={"Appearance"}>
            {withFill ?
                <Field label={"Fill Color"} columns={"2fr 1fr"}>
                    <Dropdown value={layer.fill.option} onChange={onChange(dispatch, [...path, 'fill', 'option'])}>
                        <option value='none'>None</option>
                        <option value='foreground'>{fromMask ? "Reveal" : "Foreground"}</option>
                        <option value='background'>{fromMask ? "Hide" : "Background"}</option>
                        <option value='custom'>Custom</option>
                    </Dropdown>
                    <ColorInput value={layer.fill.color} onChange={onChange(dispatch, [...path, 'fill', 'color'])} disabled={layer.fill.option !== "custom"} />
                </Field>
            : null }
            {withStroke ?
                <Field label={"Stroke Color"} columns={"2fr 1fr"}>
                    <Dropdown value={layer.stroke.option} onChange={onChange(dispatch, [...path, 'stroke', 'option'])}>
                        <option value='none'>None</option>
                        <option value='foreground'>{fromMask ? "Reveal" : "Foreground"}</option>
                        <option value='background'>{fromMask ? "Hide" : "Background"}</option>
                        <option value='custom'>Custom</option>
                    </Dropdown>
                    <ColorInput value={layer.stroke.color} onChange={onChange(dispatch, [...path, 'stroke', 'color'])} disabled={layer.stroke.option !== "custom"} />
                </Field>
            : null }
            {withStroke ?
                <Length label={"Stroke Width"} dispatch={dispatch} value={layer.stroke} path={[...path, 'stroke']} withScale />
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
