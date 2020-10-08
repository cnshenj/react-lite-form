import { useCallback } from "react";
import type { FieldProps } from "./field-props";
import { useFormContext } from "./form-context";

export interface FormBinderProps<TModel = Record<string, unknown>> extends FieldProps<TModel> {
    controlled?: boolean;
    children: (value: unknown, onChange: (value?: unknown) => void, onBlur: () => void) => JSX.Element;
}

export function FormBinder<TModel = Record<string, unknown>>(
    { name, controlled, children }: FormBinderProps<TModel>): JSX.Element {
    const { form } = useFormContext<TModel>();
    const handleChange = useCallback((newValue?: unknown) => {
        form.setValue(name, newValue, controlled);
    }, [form, name, controlled]);
    const handleBlur = useCallback(() => form.handleBlur(name), [form, name]);

    return children(form.state.model[name], handleChange, handleBlur);
}
