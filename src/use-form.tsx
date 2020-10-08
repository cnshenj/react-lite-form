import { useCallback, useEffect, useMemo, useState } from "react";
import type { StrictOmit } from "ts-essentials";
import type { LiteFormOptions } from "./lite-form";
import { LiteForm } from "./lite-form";

export function useForm<TModel>(
    initialModel: TModel,
    options: StrictOmit<LiteFormOptions<TModel>, "onUpdateView">
): LiteForm<TModel> {
    const [, setCount] = useState(0);
    const onUpdateView = useCallback(() => setCount(value => value + 1), []);
    const formOptions: LiteFormOptions<TModel> = useMemo(
        () => Object.assign({}, options, { onUpdateView }),
        [options, onUpdateView]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const form = useMemo(() => new LiteForm({ model: initialModel, fieldErrors: {}, }, formOptions), []);

    useEffect(() => {
        return () => form.dispose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return form;
}