/**
 * Extra props added to form fields. Not needed if form context is used.
 */
export interface FieldProps<TModel> {
    /** The name of the field to be bound. */
    name: keyof TModel;
}
