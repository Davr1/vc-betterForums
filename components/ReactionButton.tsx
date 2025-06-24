/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";

import { EmojiSize, FullMessage, MessageReactionWithBurst, ReactionType } from "../types";

export interface ReactionButtonProps extends MessageReactionWithBurst {
    className?: string;
    message: FullMessage;
    readOnly?: boolean;
    useChatFontScaling?: boolean;
    isLurking?: boolean;
    isPendingMember?: boolean;
    hideCount?: boolean;
    type?: ReactionType;
    emojiSize?: EmojiSize;
    emojiSizeTooltip?: EmojiSize;
}

export const ReactionButton = findComponentByCodeLazy<ReactionButtonProps>(
    "getReactionPickerAnimation"
);
