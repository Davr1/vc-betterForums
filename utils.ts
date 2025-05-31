/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import {
    GuildStore,
    i18n,
    SnowflakeUtils,
    useCallback,
    useMemo,
    useState,
    useStateFromStores,
} from "@webpack/common";
import { Channel, Guild } from "discord-types/general";

import {
    Duration,
    ForumPostUnreadCountStore,
    ReadStateStore,
    SortOrder,
    ThreadMessageStore,
} from "./stores";

const timeFormatter = findByCodeLazy('"minutes",1');

export function formatMessageCount(count: number) {
    count = Math.max(0, count);
    return count >= 50 ? "50+" : count >= 1e5 ? "100k+" : `${count}`;
}

interface MessageCount {
    messageCount: number;
    isMaxMessageCount: boolean;
    messageCountText: string;
    unreadCount: string | number | null;
}

export function useMessageCount(channel: Channel): MessageCount {
    const messageCount = useStateFromStores(
        [ThreadMessageStore],
        () => ThreadMessageStore.getCount(channel.id) ?? 0
    );
    const messageCountText = formatMessageCount(messageCount);
    const unread = useStateFromStores(
        [ReadStateStore],
        () =>
            ReadStateStore.hasTrackedUnread(channel.id) &&
            ReadStateStore.hasOpenedThread(channel.id) &&
            !!ReadStateStore.getTrackedAckMessageId(channel.id)
    );

    const unreadCount = useStateFromStores([ForumPostUnreadCountStore], () => {
        if (!unread) return null;

        const count = ForumPostUnreadCountStore.getCount(channel.id);
        if (!count) return "1+";

        const realCount = Math.min(count, messageCount);
        return realCount >= 25 ? "25+" : realCount;
    });

    return {
        messageCount,
        isMaxMessageCount: !!messageCount && `${messageCount}` !== messageCountText,
        messageCountText,
        unreadCount,
    };
}

interface ForumPostState {
    isNew: boolean;
    hasUnreads: boolean;
}

export function useForumPostState(channel: Channel): ForumPostState {
    return useStateFromStores([GuildStore, ReadStateStore], () => {
        const guild: Guild | null = GuildStore.getGuild(channel.getGuildId());
        return {
            isNew:
                !!guild &&
                !channel.isArchivedThread() &&
                ReadStateStore.isNewForumThread(channel.id, channel.parent_id, guild),
            hasUnreads:
                !!guild &&
                !channel.isArchivedThread() &&
                ReadStateStore.isForumPostUnread(channel.id),
        };
    });
}

export function useFocus<T>(callback: (data: T) => void) {
    const [isFocused, setIsFocused] = useState(false);

    return {
        isFocused,
        handleFocus: useCallback(
            (data: T) => {
                callback(data);
                setIsFocused(true);
            },
            [callback, setIsFocused]
        ),
        handleBlur: () => setIsFocused(false),
    };
}

export function useFormatTimestamp(
    channel: Channel,
    sortOrder: SortOrder,
    duration: Duration = Duration.DURATION_AGO
) {
    const timestamp = useMemo(
        () => sortOrder === SnowflakeUtils.extractTimestamp(channel.id),
        [channel.id]
    );
    const lastMessage = useStateFromStores([ReadStateStore], () =>
        ReadStateStore.lastMessageId(channel.id)
    );
    const lastMessageTimestamp = useMemo(
        () => (lastMessage && SnowflakeUtils.extractTimestamp(lastMessage)) ?? timestamp,
        [lastMessage, timestamp]
    );

    const format = useMemo(
        () => () => ({
            minutes: i18n.t.nFt9cn,
            hours: i18n.t.jzCewc,
            days: i18n.t.U4I0s7,
            month: i18n.intl.string(i18n.t["nBNJ/P"]),
        }),
        [sortOrder, duration]
    );

    return useMemo(
        () =>
            sortOrder === SortOrder.CREATION_DATE
                ? timeFormatter(timestamp, format)
                : timeFormatter(lastMessageTimestamp, format),
        [format, lastMessageTimestamp, timestamp, sortOrder]
    );
}

const isIterable = (obj: object): obj is Iterable<unknown> => Symbol.iterator in obj;
const hasEntries = (obj: object): obj is ComparableObject => "entries" in obj;
type ComparableObject = { entries(): Iterable<[PropertyKey, unknown]> } | Map<unknown, unknown>;

const compareObjects = (a: ComparableObject, b: ComparableObject): boolean => {
    const aEntries = a instanceof Map ? a : new Map(a.entries());
    const bEntries = b instanceof Map ? b : new Map(b.entries());

    if (aEntries.size !== bEntries.size) return false;

    for (const [key, value] of aEntries) {
        if (!Object.is(value, bEntries.get(key))) return false;
    }

    return true;
};

const compareIterables = (a: Iterable<unknown>, b: Iterable<unknown>): boolean => {
    const aIterator = a[Symbol.iterator]();
    const bIterator = b[Symbol.iterator]();

    let aCurrent = aIterator.next();
    let bCurrent = bIterator.next();

    while (!aCurrent.done && !bCurrent.done) {
        if (!Object.is(aCurrent.value, bCurrent.value)) return false;

        aCurrent = aIterator.next();
        bCurrent = bIterator.next();
    }

    return !!aCurrent.done && !!bCurrent.done;
};

export type CompareFn = (a: unknown, b: unknown) => boolean;

export const deepEqual: CompareFn = (a, b) => {
    if (Object.is(a, b)) return true;

    if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;

    if (isIterable(a) && isIterable(b))
        return hasEntries(a) && hasEntries(b) ? compareObjects(a, b) : compareIterables(a, b);

    return compareObjects(
        { entries: () => Object.entries(a) },
        { entries: () => Object.entries(b) }
    );
};
