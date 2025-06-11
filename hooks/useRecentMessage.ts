/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageStore, useStateFromStores } from "@webpack/common";
import { Message } from "discord-types/general";

import { ForumPostMessagesStore, ThreadMessageStore } from "../stores";
import { ThreadChannel } from "../types";

export function useRecentMessage(channel: ThreadChannel): Message | null {
    return useStateFromStores([ThreadMessageStore, ForumPostMessagesStore, MessageStore], () => {
        const recentMessage = ThreadMessageStore.getMostRecentMessage(channel.id);
        if (recentMessage) return recentMessage;

        const { firstMessage } = ForumPostMessagesStore.getMessage(channel.id);

        if (firstMessage?.id !== channel.lastMessageId)
            return MessageStore.getMessage(channel.id, channel.lastMessageId) ?? null;

        return null;
    });
}
