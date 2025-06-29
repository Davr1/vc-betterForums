/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageStore } from "@webpack/common";

import { ForumPostMessagesStore, ThreadMessageStore } from "../../stores";
import { FullMessage, ThreadChannel } from "../../types";
import { useStores } from "../misc/useStores";

export function useRecentMessage(channel: ThreadChannel): FullMessage | null {
    return useStores(
        [ThreadMessageStore, ForumPostMessagesStore, MessageStore],
        (threadMessageStore, forumPostMessagesStore, messageStore) => {
            const recentMessage = threadMessageStore.getMostRecentMessage(channel.id);
            const { firstMessage } = forumPostMessagesStore.getMessage(channel.id);

            if (recentMessage && recentMessage.id !== firstMessage?.id) return recentMessage;

            // channel.lastMessageId and recentMessage.id can be out of sync
            if (channel.lastMessageId === firstMessage?.id) return null;

            return (
                (messageStore.getMessage(channel.id, channel.lastMessageId) as FullMessage) ?? null
            );
        },
        [channel.id, channel.lastMessageId]
    );
}
