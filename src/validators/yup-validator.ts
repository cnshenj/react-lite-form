import type { ObjectSchema, ValidationError } from "yup";
import { FieldErrors } from "../lite-form";

// eslint-disable-next-line @typescript-eslint/ban-types
export async function validate<TModel extends object>(
    schema: ObjectSchema<TModel>,
    model: TModel,
    name: keyof TModel): Promise<FieldErrors<TModel>> {

    const fieldErrors: FieldErrors<TModel> = {};

    try {
        if (typeof name === "string") {
            await schema.validateAt(name, model as never);
        } else {
            await schema.validate(model);
        }
    } catch (error) {
        const validationError = error as ValidationError;
        fieldErrors[validationError.path as keyof TModel] = validationError.message;
        if (validationError.inner) {
            for (const innerError of validationError.inner) {
                fieldErrors[innerError.path as keyof TModel] = innerError.message;
            }
        }
    }

    return fieldErrors;
}