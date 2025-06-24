/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageStore, useStateFromStores } from "@webpack/common";

import { ForumPostMessagesStore, ThreadMessageStore } from "../stores";
import { FullMessage, ThreadChannel } from "../types";

export function useRecentMessage(channel: ThreadChannel): FullMessage | null {
    return useStateFromStores(
        [ThreadMessageStore, ForumPostMessagesStore, MessageStore],
        () => {
            const recentMessage = ThreadMessageStore.getMostRecentMessage(channel.id);
            const { firstMessage } = ForumPostMessagesStore.getMessage(channel.id);

            if (recentMessage && recentMessage.id !== firstMessage?.id) return recentMessage;

            // channel.lastMessageId and recentMessage.id can be out of sync
            if (channel.lastMessageId === firstMessage?.id) return null;

            return (
                (MessageStore.getMessage(channel.id, channel.lastMessageId) as FullMessage) ?? null
            );
        },
        [channel.id, channel.lastMessageId]
    );
}
