/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo, useStateFromStores } from "@webpack/common";
import { Channel } from "discord-types/general";

import { ForumPostUnreadCountStore, ReadStateStore, ThreadMessageStore } from "../stores";
import { MessageCount } from "../types";

function roundNumber(n: number): number {
    const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
    return Math.floor(n / magnitude) * magnitude;
}

function formatMessageCount(count: number): string {
    return count < 50 ? `${count}` : `${roundNumber(count)}+`;
}

function formatUnreadCount(count: number | undefined | null, totalCount: number): string {
    if (typeof count !== "number") return "1+";

    return formatMessageCount(Math.min(count, totalCount));
}

export function useMessageCount(channelId: Channel["id"]): MessageCount {
    const messageCount = useStateFromStores(
        [ThreadMessageStore],
        () => ThreadMessageStore.getCount(channelId) ?? 0
    );

    const hasUnreads = useStateFromStores(
        [ReadStateStore],
        () =>
            ReadStateStore.hasTrackedUnread(channelId) &&
            ReadStateStore.hasOpenedThread(channelId) &&
            !!ReadStateStore.getTrackedAckMessageId(channelId)
    );

    const unreadCount = useStateFromStores([ForumPostUnreadCountStore], () =>
        hasUnreads ? ForumPostUnreadCountStore.getCount(channelId) ?? null : null
    );

    const messageCountText = useMemo(() => formatMessageCount(messageCount), [messageCount]);
    const unreadCountText = useMemo(
        () => (hasUnreads ? formatUnreadCount(unreadCount, messageCount) : null),
        [hasUnreads, messageCount, unreadCount]
    );

    return { messageCount, messageCountText, unreadCount, unreadCountText };
}
