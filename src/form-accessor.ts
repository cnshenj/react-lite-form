import type { LiteForm } from "./lite-form";

/**
 * Properties to access the form data.
 */
export interface FormAccessor<TModel = Record<string, unknown>> {
    /**
     * The form containing inputs
     * The value shouldn't not change once set.
     */
    form: LiteForm<TModel>;
}
