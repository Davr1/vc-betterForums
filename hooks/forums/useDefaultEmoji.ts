/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EmojiStore, useStateFromStores } from "@webpack/common";
import { ReactionEmoji } from "discord-types/general";

import { ForumChannel } from "../../types";

export function useDefaultEmoji(channel: ForumChannel): ReactionEmoji | null {
    const emoji = channel.defaultReactionEmoji;

    const customEmoji = useStateFromStores(
        [EmojiStore],
        () => emoji?.emojiId && EmojiStore.getUsableCustomEmojiById(emoji.emojiId),
        [emoji?.emojiId]
    );

    if (!emoji) return null;

    if (emoji.emojiId && customEmoji) return customEmoji;

    if (emoji.emojiName)
        return {
            id: emoji.emojiId ?? undefined,
            name: emoji.emojiName,
            animated: false,
        };

    return null;
}
