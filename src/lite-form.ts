import type { MarkRequired, StrictOmit } from "ts-essentials";
import { ValidateWhen } from "./validate-when";

/**
 * Errors of fields.
 */
export type FieldErrors<TModel> = { [K in keyof TModel]?: string | undefined };

export interface FormState<TModel = Record<string, unknown>> {
    /** The current model. */
    readonly model: TModel;

    /** The field errors from validation. */
    readonly fieldErrors: FieldErrors<TModel>;

    /** Whether the form is validating fields. */
    readonly isValidating?: boolean;

    /** Whether the form is submitting data. */
    readonly isSubmitting?: boolean;

    /** Form-level error, e.g. submission failure. */
    readonly error?: string;
}

export type FormUpdate<TModel = Record<string, unknown>> =
    Partial<StrictOmit<FormState<TModel>, "model">> & { [path: string]: unknown };

export type FormStateProducer = <TModel>(state: FormState<TModel>, update: FormUpdate<TModel>) => FormState<TModel>;

interface DefaultLiteFormOptions {
    /**
     * Determines the condition when validations happens.
     * Conditions have priorities. If a lower priority condition is specified,
     * validation will also happen when a higher priority condition is met.
     * For example, if 'onBlur' is specified, validation will also happen before submitting form.
     */
    validateWhen: ValidateWhen;
}

const defaultLiteFormOptions: DefaultLiteFormOptions = {
    validateWhen: ValidateWhen.onBlur
};

/**
 * Options of a form.
 */
export interface LiteFormOptions<TModel = Record<string, unknown>> extends Partial<DefaultLiteFormOptions> {
    /**
     * Handles producing the form state, including the model and errors.
     * @param state The current state.
     * @param update The details of the update, will be merged with the current state.
     * @returns The updated form state.
     */
    onProduceState(state: FormState<TModel>, update: FormUpdate<TModel>): FormState<TModel>;

    /**
     * Handles updating the view, e.g. a useState hook's update function.
     * @param form The current form.
     */
    onUpdateView(form: LiteForm<TModel>): void;

    /**
     * Custom validation function. If not provided, no validation will be done.
     * @param model The current model.
     * @param initialModel The initial model.
     * @param name Optional field name indicating which field triggered the validation.
     */
    onValidate?(
        model: TModel,
        initialModel: TModel,
        name?: keyof TModel): Promise<FieldErrors<TModel>>;
}

type LiteFormConfig<TModel = Record<string, unknown>> = MarkRequired<LiteFormOptions<TModel>, "validateWhen">;

function isCheckboxOrRadio(element: HTMLInputElement): boolean {
    return element.type === "checkbox" || element.type === "radio";
}

/**
 * The form data and state.
 */
export class LiteForm<TModel = Record<string, unknown>> {
    private _state: FormState<TModel>;
    private _initialModel: TModel;
    private _config: LiteFormConfig<TModel>;

    private _observer: MutationObserver;

    /** The current form state. */
    public get state(): FormState<TModel> { return this._state; }

    /** The initial model. */
    public get initialModel(): TModel { return this._initialModel; }

    constructor(initialState: FormState<TModel>, options: LiteFormOptions<TModel>) {
        this._state = initialState;
        this._initialModel = initialState.model;

        this._config = Object.assign({}, defaultLiteFormOptions, options);

        this._observer = new MutationObserver(this.handleMutation);
        this._observer.observe(document, { childList: true });
    }

    /** Cleanup. */
    public dispose = (): void => {
        this._observer.disconnect();
    }

    /** Binds an input element to a form field. Will be passed to input elements' 'ref' property. */
    public bind = (instance: HTMLInputElement | null): void => {
        if (instance === null) {
            return;
        }

        const name = instance.name as keyof TModel;
        if (!name) {
            return;
        }

        // Initial value, only assigned when bound, so the input behaves as uncontrolled
        const value = this.state.model[name] as unknown;
        if (typeof value !== undefined) {
            if (isCheckboxOrRadio(instance)) {
                instance.checked = value as boolean;
            } else {
                instance.value = value as string;
            }
        }

        // Installs event handlers so the model will be updated and validated
        instance.addEventListener("change", this.handleInputChange);
        instance.addEventListener("blur", this.handleInputBlur);
    }

    /**
     * Sets the value of a field.
     * @param name The name of the field.
     * @param value The new value of the field.
     * @param updateView Whether to update the UI, needed for controlled input.
     */
    public setValue = (name: keyof TModel, value: unknown, updateView?: boolean): void => {
        this.updateState({ [`model.${name}`]: value }, updateView);
        if (this._config.validateWhen === ValidateWhen.onChange) {
            this.validate(name);
        }
    }

    /**
     * Determines whether the form has any validation error.
     */
    public hasError = (): boolean =>
        Object.keys(this._state.fieldErrors).some(key => this._state.fieldErrors[key as keyof TModel]);

    /**
     * Validates the form or a field.
     * @param options The options of validation.
     */
    public validate = async (name?: keyof TModel): Promise<void> => {
        const onValidate = this._config?.onValidate;
        if (!onValidate) {
            return;
        }

        this.updateState({ isValidating: true }, true);
        try {
            const fieldErrors = await onValidate(this.state.model, this._initialModel, name);
            this.updateState({ fieldErrors, isValidating: false }, true);
        }
        catch (error) {
            this.updateState({
                isValidating: false,
                error: `Failed to validate: ${error}`
            }, true);
        }

    }

    /**
     * Updates the form.
     */
    public update = (): void => {
        this._config.onUpdateView(this);
    }

    /**
     * Submits the form.
     * @param onSubmit A custom submit handler.
     */
    public submit = async (onSubmit: (model: TModel, initialModel: TModel) => Promise<void>): Promise<void> => {
        await this.validate();
        if (this.hasError()) {
            return;
        }

        this.updateState({ isSubmitting: true }, true);
        try {
            await onSubmit(this.state.model, this._initialModel);
            this.updateState({ isSubmitting: false }, true);
        }
        catch (error) {
            this.updateState({
                isSubmitting: true,
                error: `Failed to submit: ${error}`
            }, true);
        }
    }

    /**
     * Generic handler of blur events.
     * @param name The name of the field.
     */
    public handleBlur = (name: keyof TModel): void => {
        if (this._config.validateWhen !== ValidateWhen.onSubmit) {
            this.validate(name);
        }
    }

    private updateState(update: FormUpdate<TModel>, updateView?: boolean): void {
        const previousState = this._state;
        this._state = this._config.onProduceState(this._state, update);
        if (updateView && this._state !== previousState) {
            this._config.onUpdateView(this);
        }
    }

    private handleInputChange = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        const name = input.name as keyof TModel;
        this.setValue(name, isCheckboxOrRadio(input) ? input.checked : input.value);
    };

    private handleInputBlur = (event: FocusEvent): void => {
        const input = event.target as HTMLInputElement;
        const name = input.name as keyof TModel;
        this.handleBlur(name);
    };

    private handleMutation = (mutations: MutationRecord[]): void => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                for (const node of mutation.removedNodes) {
                    node.removeEventListener("change", this.handleInputChange);
                    node.removeEventListener("blur", this.handleInputBlur as EventListener);
                }
            }
        }
    }
}
