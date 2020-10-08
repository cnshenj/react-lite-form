import { produce } from "immer";
import { FormState, FormStateProducer, FormUpdate } from "../lite-form";

export const produceState = produce((draft: FormState, update: FormUpdate) => {
    for (const key in update) {
        let object = draft as unknown as Record<string, unknown>;
        let path = key;
        let index;
        while ((index = path.indexOf(".")) >= 0) {
            const propertyName = path.substr(0, index);
            object = object[propertyName] as Record<string, unknown>;
            path = path.substr(index + 1);
        }

        object[path] = update[key];
    }
}) as FormStateProducer;
