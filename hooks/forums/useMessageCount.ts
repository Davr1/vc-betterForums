/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { useMemo } from "@webpack/common";

import { settings } from "../../settings";
import { ForumPostUnreadCountStore, ThreadMessageStore } from "../../stores";
import { MessageCount } from "../../types";
import { useForumPostState } from "./useForumPostState";

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

export function useMessageCount(channel: Channel): MessageCount {
    const { useExactCounts } = settings.use(["useExactCounts"]);
    const { hasUnreads } = useForumPostState(channel);

    const messageCount = ThreadMessageStore.use($ => $.getCount(channel.id) ?? 0, [channel.id]);

    const messageCountText = useMemo(
        () => (useExactCounts ? `${messageCount}` : formatMessageCount(messageCount)),
        [messageCount, useExactCounts]
    );

    const unreadCount = ForumPostUnreadCountStore.use(
        $ => (hasUnreads ? $.getCount(channel.id) ?? null : null),
        [hasUnreads, channel.id]
    );

    const unreadCountText = useMemo(() => {
        if (unreadCount === null) return null;
        return useExactCounts
            ? `${unreadCount || "1+"}`
            : formatUnreadCount(unreadCount, messageCount);
    }, [messageCount, unreadCount, useExactCounts]);

    return { messageCount, messageCountText, unreadCount, unreadCountText };
}
