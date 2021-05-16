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
        <NumberInput value={value[valueField]} onChange={onChange(dispatch, `${path}.${valueField}`)} step={0.001} min={min} />
        <UnitDropdown value={value[unitField]} onChange={onChange(dispatch, `${path}.${unitField}`)} />
        { withScale ?  <Checkbox value={value[scaleField]} onChange={onValue(dispatch, `${path}.${scaleField}`)} title={"Use Scale Factor"} /> : null }
    </Field>
}

export const Radius = ({ value, path, dispatch, label = "Radius", tooltip, withScribe, withScale }) => {
    return <Field label={label} tooltip={tooltip} columns={`2.5fr 1fr ${withScribe ? "2fr" : ""} ${withScale ? "min-content" : ""}`}>
        <NumberInput value={value.value} onChange={onChange(dispatch, `${path}.value`)} step={0.001} min={0} />
        <UnitDropdown value={value.unit} onChange={onChange(dispatch, `${path}.unit`)} />
        { withScribe ?
            <Dropdown value={value.scribe} onChange={onChange(dispatch, `${path}.scribe`)}>
                <option value={'circumscribe'}>Circumscribe</option>
                <option value={'inscribe'}>Inscribe</option>
                <option value={'middle'}>Middle</option>
            </Dropdown>
        : null}
        { withScale ? <Checkbox value={value.useScale} onChange={onValue(dispatch, `${path}.useScale`)} title={"Use Scale Factor"} /> : null }
    </Field>
}

export const Transforms = ({ layer, path, dispatch, withRotation }) => {
    return <Field.Group label={withRotation ? "Position & Rotation" : "Position"}>
        <Tabs value={layer.posMode} onChange={onValue(dispatch, `${path}.posMode`)}>
            <Tabs.Option value={"cartesian"} label={"Cartesian"}>
                <Length label={"X Position"} dispatch={dispatch} value={layer.x} path={`${path}.x`} />
                <Length label={"Y Position"} dispatch={dispatch} value={layer.y} path={`${path}.y`} />
            </Tabs.Option>
            <Tabs.Option value={"polar"} label={"Polar"}>
                <Length label={"Distance"} dispatch={dispatch} value={layer.r} path={`${path}.r`} />
                <Field label={"Angle"}>
                    <NumberInput value={layer.t} onChange={onChange(dispatch, `${path}.t`)} step={0.001} />
                </Field>
            </Tabs.Option>
        </Tabs>
        { withRotation ?
            <Field label={"Rotation"}>
                <NumberInput value={layer.rotation} onChange={onChange(dispatch, `${path}.rotation`)} step={0.001} />
            </Field>
        : null}
    </Field.Group>
}

export const Appearance = ({ layer, path, dispatch, withStroke, withFill, fromMask }) => {
    if (withFill || withStroke) {
        return <Field.Group label={"Appearance"}>
            {withFill ?
                <Field label={"Fill Color"} columns={"2fr 1fr"}>
                    <Dropdown value={layer.fill.option} onChange={onChange(dispatch, `${path}.fill.option`)}>
                        <option value='none'>None</option>
                        <option value='foreground'>{fromMask ? "Reveal" : "Foreground"}</option>
                        <option value='background'>{fromMask ? "Hide" : "Background"}</option>
                        <option value='custom'>Custom</option>
                    </Dropdown>
                    <ColorInput value={layer.fill.color} onChange={onChange(dispatch, `${path}.fill.color`)} disabled={layer.fill.option !== "custom"} />
                </Field>
            : null }
            {withStroke ?
                <Field label={"Stroke Color"} columns={"2fr 1fr"}>
                    <Dropdown value={layer.stroke.option} onChange={onChange(dispatch, `${path}.stroke.option`)}>
                        <option value='none'>None</option>
                        <option value='foreground'>{fromMask ? "Reveal" : "Foreground"}</option>
                        <option value='background'>{fromMask ? "Hide" : "Background"}</option>
                        <option value='custom'>Custom</option>
                    </Dropdown>
                    <ColorInput value={layer.stroke.color} onChange={onChange(dispatch, `${path}.stroke.color`)} disabled={layer.stroke.option !== "custom"} />
                </Field>
            : null }
            {withStroke ?
                <Length label={"Stroke Width"} dispatch={dispatch} value={layer.stroke} path={`${path}.stroke`} withScale />
            : null }
        </Field.Group>
    }
    return null;
}

const output = {
    Transforms,
    Appearance,
    Length,
    Radius
}

export default output;
