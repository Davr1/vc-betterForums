/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Ref } from "react";

export const useFocusRing: <T extends HTMLElement = HTMLElement>() => {
    ref: Ref<T>;
    width: number;
    height: number | null;
} = findByCodeLazy(/,\{ref:\i,width:\i,height:\i\}\}/);
