/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";

interface ThreeDotsProps {
    dotRadius?: number;
    x?: number;
    y?: number;
    themed?: boolean;
    hide?: boolean;
    className?: string;
}

export const ThreeDots = findComponentByCodeLazy<ThreeDotsProps>(".dots,", "dotRadius:");
