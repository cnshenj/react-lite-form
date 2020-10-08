import React, { Provider, ReactNode } from "react";
import type { FormAccessor } from "./form-accessor";
import { FormContext } from "./form-context";
import type { LiteForm } from "./lite-form";

export interface FormProviderProps<TModel> {
    form: LiteForm<TModel>;
    children?: ReactNode;
}

export function FormProvider<TModel>({ form, children }: FormProviderProps<TModel>): JSX.Element {
    const FormContextProvider = FormContext.Provider as unknown as Provider<FormAccessor<TModel>>;
    return (
        // Always create a new context value to trigger a rendering pass
        <FormContextProvider value={({ form })}>
            {children}
        </FormContextProvider>
    );
}
