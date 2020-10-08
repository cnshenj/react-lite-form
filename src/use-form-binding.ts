import React, { SyntheticEvent, useCallback } from "react";
import type { FieldProps } from "./field-props";
import { useFormContext } from "./form-context";

export type BlurEventHandler = (event: React.FocusEvent<HTMLElement>) => void;

// eslint-disable-next-line @typescript-eslint/ban-types
export interface BindOptions<TModel, TOnChange extends Function> {
    /** Props from the target component related to form field. */
    props: FieldProps<TModel> & { onBlur?: BlurEventHandler };

    /** Whether the target component is a controlled component. */
    controlled?: boolean;

    /**
     * Simulate blur event when change event happens. Useful in two scenarios:
     * 1. Some components doesn't have a blur event (e.g. checkbox). Simulate blur on change for validation.
     * 2. Some components send blur event before change event, which will trigger validation before change is effective.
     *    Simulate blur on change for proper validation.
     */
    blurOnChange?: boolean;

    /** The change event handler provided by parent. */
    onChange?: TOnChange;

    /** The blur event handler provided by parent. */
    onBlur?: BlurEventHandler;

    /** Converts a model property to a field value. */
    modelToField?(value: unknown): unknown;

    /** Converts an event to a model property. */
    eventToModel?(eventData: unknown, currentValue: unknown): unknown
}

export interface BindProps<TModel, TOnChange> {
    fieldProps: Required<FieldProps<TModel>>;
    value: unknown;
    handleChange: TOnChange,
    handleBlur: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormBinding<TModel, TOnChange extends Function>({
    props,
    controlled,
    blurOnChange,
    onChange,
    onBlur,
    modelToField,
    eventToModel }: BindOptions<TModel, TOnChange>): BindProps<TModel, TOnChange> {

    const { name } = props;
    const { form } = useFormContext<TModel>();

    const handleBlur = useCallback(() => {
        form.handleBlur(name);
        const customOnBlur = onBlur ?? props.onBlur;
        if (customOnBlur) {
            (customOnBlur as () => void)();
        }
    }, [form, name, onBlur, props.onBlur]);

    const handleChange = useCallback((...args: unknown[]) => {
        if (args.length === 0) {
            return;
        }

        let eventValue = args[0];
        if (isEvent(eventValue) && args.length > 1) {
            // First argument is an event, use second argument as value if it exists
            eventValue = args[1];
        }

        form.setValue(name, eventToModel ? eventToModel(eventValue, form.state.model[name]) : eventValue, controlled);

        if (blurOnChange) {
            // Trigger blur for proper validation
            handleBlur();
        }

        if (onChange) {
            // Call custom event handler
            onChange(...args);
        }
    }, [form, name, controlled, blurOnChange, onChange, eventToModel, handleBlur]) as unknown as TOnChange;

    const value = form.state.model[name];
    return {
        fieldProps: { name },
        value: modelToField ? modelToField(value) : value,
        handleChange,
        handleBlur
    };
}

function isEvent(value: unknown): value is Event {
    return typeof value === "object"
        && (value instanceof Event || (value as SyntheticEvent).nativeEvent instanceof Event);
}
