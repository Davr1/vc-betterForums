/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Stores from "@vencord/discord-types";
import {
    Channel,
    FluxEvents,
    FluxStore,
    Guild,
    RelationshipStore as PartialRelationshipStore,
    User,
} from "@vencord/discord-types";

import { DiscordTag, FullChannel, FullMessage, FullUser, KeywordTrie } from "../types";

export type FluxEventHandlers<T extends Partial<Record<FluxEvents, unknown>>> = {
    [K in keyof T]?: (data: T[K]) => void;
} & {
    [K in FluxEvents]?: (data: T[K]) => void;
};

export namespace ExtendedStores {
    export interface ChannelSectionStore extends FluxStore {
        getCurrentSidebarChannelId: (parentChannelId: Channel["id"]) => Channel["id"] | null;
    }

    export interface ForumPostMessagesStore extends FluxStore {
        isLoading(channelId: Channel["id"]): boolean;
        getMessage(channelId: Channel["id"]): { firstMessage: FullMessage | null; loaded: boolean };
    }

    export interface ThreadMessageStore extends FluxStore {
        getCount(channelId: Channel["id"]): number | null;
        getMostRecentMessage(channelId: Channel["id"]): FullMessage | null;
    }

    export interface ForumPostUnreadCountStore extends FluxStore {
        getCount(channelId: Channel["id"]): number | undefined;
    }

    export interface GuildMemberRequesterStore extends FluxStore {
        requestMember(guildId: Guild["id"], userId: User["id"]): void;
    }

    export interface TypingStore extends FluxStore {
        getTypingUsers(channelId: Channel["id"]): Record<User["id"], number>;
    }

    export interface ForumSearchStore extends FluxStore {
        getSearchQuery(channelId: Channel["id"]): string | undefined;
        getHasSearchResults(channelId: Channel["id"]): boolean;
    }

    export interface ReadStateStore extends FluxStore {
        hasTrackedUnread(channelId: Channel["id"]): boolean;
        hasOpenedThread(channelId: Channel["id"]): boolean;
        getTrackedAckMessageId(channelId: Channel["id"]): FullMessage["id"] | null;
        isNewForumThread(
            channelId: Channel["id"],
            parentChannelId: Channel["id"],
            guild: Guild
        ): boolean;
        isForumPostUnread(channelId: Channel["id"]): boolean;
        lastMessageId(channelId: Channel["id"]): FullMessage["id"] | null;
        getOldestUnreadMessageId(channelId: Channel["id"]): FullMessage["id"] | null;
    }

    export interface RelationshipStore extends PartialRelationshipStore {
        isBlockedOrIgnored(userId: User["id"]): boolean;
        isBlockedForMessage(message: FullMessage): boolean;
        isIgnoredForMessage(message: FullMessage): boolean;
    }

    export interface GuildMemberStore extends FluxStore, Stores.GuildMemberStore {
        isCurrentUserGuest(guildId: Guild["id"]): boolean;
    }

    export interface LurkingStore extends FluxStore {
        isLurking(guildId: Guild["id"]): boolean;
    }

    export interface PermissionStore extends FluxStore {
        can(permission: BigInt, channel: Channel): boolean;
    }

    export interface GuildVerificationStore extends FluxStore {
        canChatInGuild(guildId: Guild["id"]): boolean;
    }

    export interface ChannelStore extends FluxStore, Omit<Stores.ChannelStore, "getChannel"> {
        getChannel(channelId: Channel["id"]): FullChannel | undefined;
        loadAllGuildAndPrivateChannelsFromDisk(): Record<Channel["id"], FullChannel>;
    }

    export interface JoinedThreadsStore extends FluxStore {
        hasJoined(threadId: Channel["id"]): boolean;
        isMuted(threadId: Channel["id"]): boolean;
    }

    export interface ThreadMembersStore extends FluxStore {
        getMemberCount(threadId: Channel["id"]): number | null;
        getMemberIdsPreview(threadId: Channel["id"]): User["id"][] | null;
    }

    export interface UserSettingsProtoStore extends FluxStore {
        settings: {
            textAndImages: {
                keywordFilterSettings?: Record<
                    "profanity" | "sexualContent" | "slurs",
                    { value: boolean }
                >;
            };
        };
    }

    export interface UserStore extends FluxStore, Omit<Stores.UserStore, "getUser"> {
        getUser(userId: User["id"]): FullUser | undefined;
        getCurrentUser(): FullUser;
    }

    export interface MissingGuildMemberStore extends FluxStore {
        reset(): void;
        isMember(guildId: Guild["id"], userId: User["id"]): boolean;
        requestMembersBulk(guildId: Guild["id"], userIds: User["id"][]): void;
    }

    export interface KeywordFilterStore extends FluxStore {
        getKeywordTrie(): KeywordTrie | null;
    }
}

export enum LayoutType {
    DEFAULT = 0,
    LIST = 1,
    GRID = 2,
}

export enum SortOrder {
    LATEST_ACTIVITY = 0,
    CREATION_DATE = 1,
}

export enum TagSetting {
    MATCH_SOME = "match_some",
    MATCH_ALL = "match_all",
}

export enum Duration {
    DURATION_AGO = 0,
    POSTED_DURATION_AGO = 1,
}

export interface ChannelState {
    layoutType: LayoutType;
    sortOrder: SortOrder;
    tagFilter: Set<string>;
    scrollPosition: 0;
    tagSetting: TagSetting;
}

export interface ForumChannelStoreState {
    channelStates: Record<Channel["id"], ChannelState>;
}

export interface ForumChannelStore extends ForumChannelStoreState {
    getChannelState(channelId: Channel["id"]): ChannelState | undefined;
    toggleTagFilter(channelId: Channel["id"], tagId: DiscordTag["id"]): void;
}

export interface ForumPostComposerStore {
    setCardHeight(channelId: Channel["id"], height: number): void;
}
