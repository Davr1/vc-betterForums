/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CSSProperties } from "react";

export function textClampStyle(clamp: number | null = null) {
    if (!clamp) return {} as const;

    return {
        display: "-webkit-box",
        lineClamp: clamp,
        WebkitLineClamp: clamp,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
    } as const satisfies CSSProperties;
}
