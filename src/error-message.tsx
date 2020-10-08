import React from "react";
import { useMemoizeOne } from "./common-hooks";
import type { FieldProps } from "./field-props";
import { useFormContext } from "./form-context";

export interface ErrorMessageProps<TModel = Record<string, unknown>> extends FieldProps<TModel> {
    className?: string;
}

export function ErrorMessage<TModel = Record<string, unknown>>(
    { name, className }: ErrorMessageProps<TModel>): JSX.Element | null {

    const { form } = useFormContext<TModel>();
    const error = form.state.fieldErrors[name];

    return useMemoizeOne(
        () => error ? <div className={className}>{error}</div> : null,
        [className, error]);
}
