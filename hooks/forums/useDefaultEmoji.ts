/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ReactionEmoji } from "@vencord/discord-types";
import { EmojiStore } from "@webpack/common";

import { ForumChannel } from "../../types";
import { useStores } from "../misc/useStores";

export function useDefaultEmoji(channel: ForumChannel): ReactionEmoji | null {
    const emoji = channel.defaultReactionEmoji;

    const customEmoji = useStores([EmojiStore], $ => $.getUsableCustomEmojiById(emoji?.emojiId), [
        emoji?.emojiId,
    ]);

    if (customEmoji) return customEmoji;

    if (!emoji?.emojiName) return null;

    return {
        id: emoji.emojiId ?? undefined,
        name: emoji.emojiName,
        animated: false,
    };
}
