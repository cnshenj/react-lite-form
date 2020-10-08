/**
* Determines the condition when validations happens.
* Conditions have priorities. If a lower priority condition is specified,
* validation will also happen when a higher priority condition is met.
* For example, if 'onBlur' is specified, validation will also happen before submitting form.
*/
export enum ValidateWhen {
    onSubmit = "onSubmit",
    onBlur = "onBlur",
    onChange = "onChange"
}