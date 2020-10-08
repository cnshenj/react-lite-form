import memoizeOne from "memoize-one";
import { DependencyList, useCallback } from "react";

/**
 * Like useMemo, but only caches the latest value.
 * It is memory efficient but is enough for rendering optimization.
 * @param factory The factory that produces values.
 * @param deps The dependencies.
 */
export function useMemoizeOne<T>(factory: () => T, deps: DependencyList): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const callback = useCallback(
        memoizeOne(
            (callee: () => T, ..._deps: unknown[]) => callee(),
            areDependenciesEqual),
        []);
    return callback(factory, ...deps);
}

function areDependenciesEqual(args: unknown[], prevArgs: unknown[]): boolean {
    if (args.length !== prevArgs.length) {
        return false;
    }

    // Skip the first argument since it is the factory
    for (let i = 1; i < args.length; ++i) {
        if (args[i] !== prevArgs[i]) {
            return false;
        }
    }

    return true;
}
