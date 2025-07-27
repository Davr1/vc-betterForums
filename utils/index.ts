/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { LazyComponent } from "@utils/lazyReact";
import { React } from "@webpack/common";
import { ComponentType } from "react";

export * from "./ast";
export * from "./attachmentParser";
export * from "./constants";
export * from "./discord";
export * from "./files";
export * from "./json";
export * from "./media";
export * from "./messageParser";
export * from "./text";
export * from "./validators";

export function indexedDBStorageFactory<T>() {
    return {
        async getItem(name: string): Promise<T | null> {
            return (await DataStore.get(name)) ?? null;
        },
        async setItem(name: string, value: T): Promise<void> {
            await DataStore.set(name, value);
        },
        async removeItem(name: string): Promise<void> {
            await DataStore.del(name);
        },
    };
}

export function _memo<TProps extends object = {}>(component: ComponentType<TProps>) {
    return LazyComponent(() => React.memo(component));
}

export type Merger<T extends object> = {
    [K in keyof T]?: boolean | ((p1: T[K], p2: T[K], objs: [T, T]) => boolean);
};

export function diffObjects<T extends object, TMerged extends boolean = false>(
    obj1: T,
    obj2: Partial<T>,
    merger: Merger<T>,
    returnMerged?: TMerged
): TMerged extends true ? T : Partial<T> {
    const mergerKeys = new Set(Reflect.ownKeys(merger));
    const keys = new Set([...Reflect.ownKeys(obj1), ...Reflect.ownKeys(obj2)]);

    const obj = (returnMerged ? { ...obj1 } : {}) as ReturnType<typeof diffObjects<T, TMerged>>;
    for (const key of keys.intersection(mergerKeys)) {
        if (
            typeof merger[key] === "boolean"
                ? merger[key]
                : merger[key]?.(obj1[key], obj2[key], [obj1, obj2])
        )
            obj[key] = obj2[key];
    }
    return obj;
}

export function hasFlag(value: number | undefined | null, flag: number): boolean {
    return !!value && (value & flag) === flag;
}

export function pipe<T, C extends unknown[]>(
    args: readonly [T, ...C],
    ...fns: Array<((...args: [T, ...C]) => T | void | null) | undefined | null | false>
): T {
    return fns.reduce(
        ([result, ...rest], fn) =>
            [typeof fn === "function" ? fn(result, ...rest) ?? result : result, ...rest] as const,
        args
    )![0];
}
