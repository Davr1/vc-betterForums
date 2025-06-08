/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Channel } from "discord-types/general";

interface TypingTextProps {
    channel: Channel;
    className?: string;
    renderDots?: boolean;
}

export const TypingText = findComponentByCodeLazy<TypingTextProps>(
    "getUserCombo",
    "isThreadCreation"
);
