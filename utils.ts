/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { runtimeHashMessageKey } from "@utils/intlHash";
import { findByCodeLazy } from "@webpack";
import {
    ChannelStore,
    EmojiStore,
    GuildStore,
    i18n,
    React,
    SnowflakeUtils,
    useEffect,
    useMemo,
    UserStore,
    useStateFromStores,
} from "@webpack/common";
import { Channel, Guild, ReactionEmoji, User } from "discord-types/general";

import {
    ChannelState,
    Duration,
    ForumChannelStore,
    ForumPostUnreadCountStore,
    ForumSearchStore,
    GuildMemberRequesterStore,
    GuildMemberStore,
    GuildVerificationStore,
    LayoutType,
    LurkingStore,
    PermissionStore,
    ReadStateStore,
    RelationshipStore,
    SortOrder,
    TagSetting,
    ThreadMessageStore,
    TypingStore,
} from "./stores";

export interface ForumChannel extends Channel {
    defaultReactionEmoji: Record<"emojiId" | "emojiName", string | null> | null;
    availableTags: Tag[] | null;
}

export interface ThreadChannel extends Channel {
    appliedTags: Tag["id"][] | null;
    isArchivedLockedThread(): boolean;
}

type TimeFormatterOptions = Record<
    "minutes" | "hours" | "days" | "month",
    string | (() => unknown)
>;
const timeFormatter: (timestamp: number | null, options?: () => TimeFormatterOptions) => string =
    findByCodeLazy('"minutes",1');

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

const timeFormat = () =>
    ({
        minutes: i18n.t[runtimeHashMessageKey("FORM_POST_CREATED_AGO_TIMESTAMP_MINUTES")],
        hours: i18n.t[runtimeHashMessageKey("FORM_POST_CREATED_AGO_TIMESTAMP_HOURS")],
        days: i18n.t[runtimeHashMessageKey("FORM_POST_CREATED_AGO_TIMESTAMP_DAYS")],
        month: getIntlMessage("FORM_POST_CREATED_AGO_TIMESTAMP_MORE_THAN_MONTH"),
    } as TimeFormatterOptions);

export function useFormatTimestamp(
    channel: Channel,
    sortOrder: SortOrder,
    duration: Duration = Duration.DURATION_AGO
): string {
    const timestamp = useMemo(() => SnowflakeUtils.extractTimestamp(channel.id), [channel.id]);

    const lastMessage = useStateFromStores([ReadStateStore], () =>
        ReadStateStore.lastMessageId(channel.id)
    );

    const lastMessageTimestamp = useMemo(
        () => (lastMessage ? SnowflakeUtils.extractTimestamp(lastMessage) : timestamp),
        [lastMessage, timestamp]
    );

    const targetTimestamp = useMemo(
        () => (sortOrder === SortOrder.CREATION_DATE ? timestamp : lastMessageTimestamp),
        [lastMessageTimestamp, sortOrder, timestamp]
    );
    const format = useMemo(
        () =>
            sortOrder === SortOrder.CREATION_DATE && duration === Duration.POSTED_DURATION_AGO
                ? timeFormat
                : undefined,
        [sortOrder, duration]
    );

    return useMemo(() => timeFormatter(targetTimestamp, format), [targetTimestamp, format]);
}

const isIterable = (obj: object): obj is Iterable<unknown> =>
    typeof obj?.[Symbol.iterator] === "function";
const hasEntries = (obj: object): obj is ComparableObject =>
    ("entries" in obj && typeof obj?.entries === "function") || obj instanceof Map;
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

    let aNext = aIterator.next();
    let bNext = bIterator.next();

    while (!aNext.done && !bNext.done) {
        if (!Object.is(aNext.value, bNext.value)) return false;

        aNext = aIterator.next();
        bNext = bIterator.next();
    }

    return !!aNext.done && !!bNext.done;
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

export function useTypingUsers(
    channelId: Channel["id"],
    limit: number = Number.MAX_SAFE_INTEGER
): User["id"][] {
    return useStateFromStores(
        [UserStore, TypingStore, RelationshipStore],
        () => {
            const currentUserId = UserStore.getCurrentUser()?.id;
            const typingUsers = TypingStore.getTypingUsers(channelId);
            const users: User["id"][] = [];

            for (const userId in typingUsers) {
                if (users.length >= limit) break;
                const user = UserStore.getUser(userId);
                if (!user || user.id === currentUserId) continue;

                if (!RelationshipStore.isBlockedOrIgnored(user.id)) {
                    users.push(user.id);
                }
            }

            return users;
        },
        [channelId, limit]
    );
}

export function useUsers(channel: Channel, userIds: User["id"][]) {
    const users = useStateFromStores([UserStore], () =>
        userIds.map(UserStore.getUser).filter(Boolean)
    );
    useEffect(() => {
        users.forEach(user => {
            GuildMemberRequesterStore.requestMember(channel.guild_id, user.id);
        });
    }, []);

    return users;
}

export function useDefaultEmoji(channel: ForumChannel): ReactionEmoji | null {
    const emoji = channel.defaultReactionEmoji;
    if (!emoji) return null;

    const customEmoji = useStateFromStores([EmojiStore], () =>
        EmojiStore.getUsableCustomEmojiById(emoji.emojiId)
    );

    if (emoji.emojiId && customEmoji)
        return {
            id: emoji.emojiId,
            name: customEmoji.name,
            animated: customEmoji.animated,
        };
    if (emoji.emojiName)
        return {
            id: emoji.emojiId ?? undefined,
            name: emoji.emojiName,
            animated: false,
        };

    return null;
}

function useIsActiveChannelOrUnarchivableThread(channel: Channel | null): boolean {
    const canSendMessagesInThreads = useStateFromStores(
        [PermissionStore],
        () => !!channel && PermissionStore.can(1n << 38n, channel)
    );
    return (
        !!channel &&
        (!channel.isThread() ||
            channel.isActiveThread() ||
            (channel.isArchivedThread() &&
                channel.threadMetadata?.locked !== true &&
                canSendMessagesInThreads))
    );
}

export function useCheckPermissions(
    channel: Channel
): Record<
    | `disableReaction${"Reads" | "Creates" | "Updates"}`
    | `is${"Lurking" | "Guest" | "PendingMember"}`,
    boolean
> {
    const guildId = channel?.getGuildId();
    const canChat = useStateFromStores(
        [GuildVerificationStore],
        () => !guildId || GuildVerificationStore.canChatInGuild(guildId),
        [guildId]
    );
    const isLurking = useStateFromStores(
        [LurkingStore],
        () => !!guildId && LurkingStore.isLurking(guildId),
        [guildId]
    );
    const isGuest = useStateFromStores(
        [GuildMemberStore],
        () => !!guildId && GuildMemberStore.isCurrentUserGuest(guildId),
        [guildId]
    );
    const canAddNewReactions = useStateFromStores(
        [PermissionStore],
        () => canChat && PermissionStore.can(1n << 6n, channel),
        [canChat, channel]
    );
    const isActiveChannelOrUnarchivableThread = useIsActiveChannelOrUnarchivableThread(channel);
    if (!channel)
        return {
            disableReactionReads: true,
            disableReactionCreates: true,
            disableReactionUpdates: true,
            isLurking: false,
            isGuest: false,
            isPendingMember: false,
        };

    const isPrivate = channel.isPrivate(),
        isSystemDM = channel.isSystemDM(),
        idk = (canChat || isPrivate) && isActiveChannelOrUnarchivableThread;

    return {
        disableReactionReads: false,
        disableReactionCreates:
            isLurking ||
            isGuest ||
            !idk ||
            !(
                (canAddNewReactions === true || isPrivate) &&
                !isSystemDM &&
                isActiveChannelOrUnarchivableThread
            ),
        disableReactionUpdates: isLurking || isGuest || !idk,
        isLurking,
        isGuest,
        isPendingMember: false,
    };
}

type Match = {
    type: "text" | "highlight";
    content: string | Match;
    originalMatch: RegExpExecArray;
};
type PostProcessor = (match: Match[], filters: Set<string>) => Match[];
const getTitlePostprocessor: (query: string) => PostProcessor = findByCodeLazy('type:"highlight"');
const textHightlightParser: (
    data: { content: string; embeds: [] },
    options: { postProcessor: PostProcessor }
) => {
    content: React.ReactNode;
    hasSpoilerEmbeds: boolean;
} = findByCodeLazy("hideSimpleEmbedContent:", "1!==");

export function useChannelName(channel: Channel): React.ReactNode {
    const hasSearchResults = useStateFromStores([ForumSearchStore], () =>
        ForumSearchStore.getHasSearchResults(channel.parent_id)
    );

    const searchQuery = useStateFromStores([ForumSearchStore], () =>
        ForumSearchStore.getSearchQuery(channel.parent_id)
    );

    const postProcessor = useMemo(
        () => getTitlePostprocessor(hasSearchResults && searchQuery ? searchQuery : ""),
        [hasSearchResults, searchQuery]
    );

    return React.useMemo(
        () =>
            textHightlightParser({ content: channel.name, embeds: [] }, { postProcessor }).content,
        [channel.name, postProcessor]
    );
}

export interface Tag {
    id: string;
    name: string;
    emojiId: null | string;
    emojiName: null | string;
    moderated: boolean;
}

function useTags(channel: ThreadChannel): Tag[] {
    return useStateFromStores([ChannelStore], () => {
        const forumChannel = ChannelStore.getChannel(channel.parent_id) as ForumChannel | null;

        const availableTags = (forumChannel?.availableTags ?? []).reduce((acc, tag) => {
            acc[tag.id] = tag;
            return acc;
        }, {} as Record<Tag["id"], Tag>);

        return (channel.appliedTags ?? []).map(tag => availableTags[tag]);
    });
}

interface ForumPostInfoOptions {
    channel: ThreadChannel;
    isNew?: boolean;
}

export function useForumPostInfo({ channel, isNew }: ForumPostInfoOptions) {
    const appliedTags = useTags(channel);

    const shownTags = appliedTags.slice(undefined, 3);
    const remainingTags = appliedTags.slice(3);
    const moreTagsCount = appliedTags.length > 3 ? appliedTags.length - 3 : 0;
    const isPinned = channel.hasFlag(2);
    const shouldRenderTagsRow = shownTags.length > 0 || isPinned || !!isNew;

    return {
        shownTags,
        remainingTags,
        moreTagsCount,
        isPinned,
        shouldRenderTagsRow,
        forumPostContainsTags: appliedTags.length > 0,
    };
}

let ForumChannelStore: ForumChannelStore | null = null;
export function setForumChannelStore(store: ForumChannelStore) {
    ForumChannelStore = store;
}

export function useForumChannelState(channelId: Channel["id"]): ChannelState {
    const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId));

    return !channel || !ForumChannelStore
        ? {
              layoutType: LayoutType.LIST,
              sortOrder: SortOrder.CREATION_DATE,
              tagFilter: new Set(),
              scrollPosition: 0,
              tagSetting: TagSetting.MATCH_SOME,
          }
        : ForumChannelStore.getChannelState(channelId)!;
}
