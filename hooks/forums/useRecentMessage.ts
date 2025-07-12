/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageStore } from "@webpack/common";

import { ForumPostMessagesStore, ThreadMessageStore } from "../../stores";
import { FullMessage, ThreadChannel } from "../../types";
import { useStores } from "../misc/useStores";

export function useRecentMessage({ id, lastMessageId }: ThreadChannel): FullMessage | null {
    return useStores(
        [ThreadMessageStore, ForumPostMessagesStore, MessageStore],
        (threadMessageStore, forumPostMessagesStore, messageStore) => {
            const recentMessage = threadMessageStore.getMostRecentMessage(id);
            const { firstMessage } = forumPostMessagesStore.getMessage(id);

            if (recentMessage && recentMessage.id !== firstMessage?.id) return recentMessage;

            // channel.lastMessageId and recentMessage.id can be out of sync
            if (lastMessageId === firstMessage?.id) return null;

            return (messageStore.getMessage(id, lastMessageId) as FullMessage) ?? null;
        },
        [id, lastMessageId]
    );
}
