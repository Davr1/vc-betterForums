/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { ReactionEmoji } from "discord-types/general";

import { EmojiSize } from "../types";

interface EmojiProps {
    animated?: boolean;
    className?: string;
    emojiId: ReactionEmoji["id"] | null;
    emojiName: ReactionEmoji["name"] | null;
    size?: EmojiSize;
}

export const Emoji = findComponentByCodeLazy<EmojiProps>(/void 0===\i\.shouldAnimate/);
