/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useStateFromStores } from "@webpack/common";
import { FluxStore } from "@webpack/types";

export function useStores<TStores extends readonly FluxStore[], TReturn>(
    stores: [...TStores],
    mapper: (...args: TStores) => TReturn,
    deps?: unknown[],
    isEqual?: (old: TReturn, newer: TReturn) => boolean
): TReturn {
    return useStateFromStores(stores, () => mapper(...stores), deps ?? [], isEqual);
}
