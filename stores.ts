/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findStoreLazy } from "@webpack";
import { FluxStore } from "@webpack/types";
import { Channel, Guild, Message, User } from "discord-types/general";
import * as Stores from "discord-types/stores";

interface ChannelSectionStore extends FluxStore {
    getCurrentSidebarChannelId: (parentChannelId: Channel["id"]) => Channel["id"] | null;
}

interface ForumPostMessagesStore extends FluxStore {
    isLoading(channelId: Channel["id"]): boolean;

    getMessage(channelId: Channel["id"]): { firstMessage: Message | null };
}

interface ThreadMessageStore extends FluxStore {
    getCount(channelId: Channel["id"]): number | null;
    getMostRecentMessage(channelId: Channel["id"]): Message | null;
}

interface ForumPostUnreadCountStore extends FluxStore {
    getCount(channelId: Channel["id"]): number | undefined;
}

interface GuildMemberRequesterStore extends FluxStore {
    requestMember(guildId: Guild["id"], userId: User["id"]): void;
}

interface TypingStore extends FluxStore {
    getTypingUsers(channelId: Channel["id"]): Record<User["id"], number>;
}

interface ForumSearchStore extends FluxStore {
    getSearchQuery(channelId: Channel["id"]): string | undefined;
    getHasSearchResults(channelId: Channel["id"]): boolean;
}

interface ReadStateStore extends FluxStore {
    hasTrackedUnread(channelId: Channel["id"]): boolean;
    hasOpenedThread(channelId: Channel["id"]): boolean;
    getTrackedAckMessageId(channelId: Channel["id"]): Message["id"] | null;
    isNewForumThread(
        channelId: Channel["id"],
        parentChannelId: Channel["id"],
        guild: Guild
    ): boolean;
    isForumPostUnread(channelId: Channel["id"]): boolean;
    lastMessageId(channelId: Channel["id"]): Message["id"] | null;
}

interface RelationshipStore extends FluxStore, Stores.RelationshipStore {
    isBlockedOrIgnored(userId: User["id"]): boolean;
    isBlockedForMessage(message: Message): boolean;
    isIgnoredForMessage(message: Message): boolean;
}

interface GuildMemberStore extends FluxStore, Stores.GuildMemberStore {
    isCurrentUserGuest(guildId: Guild["id"]): boolean;
}

interface LurkingStore extends FluxStore {
    isLurking(guildId: Guild["id"]): boolean;
}

interface PermissionStore extends FluxStore {
    can(permission: BigInt, channel: Channel): boolean;
}

interface GuildVerificationStore extends FluxStore {
    canChatInGuild(guildId: Guild["id"]): boolean;
}

interface BasicUser {
    userId: User["id"];
    displayName: User["username"];
    canViewChannel?: boolean;
}

interface Section {
    sectionId: "online" | "offline" | (string & {});
    userIds: BasicUser["userId"][];
    usersById: Record<BasicUser["userId"], BasicUser>;
}

interface ThreadMemberListStore extends FluxStore {
    getMemberListSections(
        channelId: Channel["id"]
    ): Record<Section["sectionId"], Section> | undefined;
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

export interface ForumChannelStore extends ForumChannelStoreState {
    getChannelState(channelId: Channel["id"]): ChannelState | undefined;
}

export interface ForumChannelStoreState {
    channelStates: Record<Channel["id"], ChannelState>;
}

export interface ForumPostComposerStore {
    setCardHeight(channelId: Channel["id"], height: number): void;
}

export const ChannelSectionStore: ChannelSectionStore = findStoreLazy("ChannelSectionStore");
export const ForumPostMessagesStore: ForumPostMessagesStore =
    findStoreLazy("ForumPostMessagesStore");
export const ThreadMessageStore: ThreadMessageStore = findStoreLazy("ThreadMessageStore");
export const ForumPostUnreadCountStore: ForumPostUnreadCountStore = findStoreLazy(
    "ForumPostUnreadCountStore"
);
export const GuildMemberRequesterStore: GuildMemberRequesterStore = findStoreLazy(
    "GuildMemberRequesterStore"
);
export const TypingStore: TypingStore = findStoreLazy("TypingStore");
export const ForumSearchStore: ForumSearchStore = findStoreLazy("ForumSearchStore");
export const ReadStateStore: ReadStateStore = findStoreLazy("ReadStateStore");
export const GuildVerificationStore: GuildVerificationStore =
    findStoreLazy("GuildVerificationStore");
export const LurkingStore: LurkingStore = findStoreLazy("LurkingStore");
export const RelationshipStore: RelationshipStore = findStoreLazy("RelationshipStore");
export const GuildMemberStore: GuildMemberStore = findStoreLazy("GuildMemberStore");
export const PermissionStore: PermissionStore = findStoreLazy("PermissionStore");
export const ThreadMemberListStore: ThreadMemberListStore = findStoreLazy("ThreadMemberListStore");
