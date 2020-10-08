import React, { useContext } from "react";
import type { FormAccessor } from "./form-accessor";

export const FormContext = React.createContext<Partial<FormAccessor>>({});

export function useFormContext<TModel>(): FormAccessor<TModel> {
    const context = useContext(FormContext) as Partial<FormAccessor<TModel>>;
    if (context.form) {
        return context as FormAccessor<TModel>;
    }

    throw new Error("No form provided in context.");
}
