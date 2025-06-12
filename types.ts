/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, GuildMember, Message, MessageReaction, User } from "discord-types/general";
import { ReactNode } from "react";

export interface ForumChannel extends Channel {
    defaultReactionEmoji: Record<"emojiId" | "emojiName", string | null> | null;
    availableTags: DiscordTag[] | null;
}

export interface ThreadMetadata {
    archived: boolean;
    autoArchiveDuration: number;
    archiveTimestamp: string;
    createTimestamp: string;
    locked: boolean;
    invitable: boolean;
}

export interface ThreadChannel extends Channel {
    appliedTags: DiscordTag["id"][] | null;
    memberIdsPreview: User["id"][];
    memberCount: number;
    messageCount: number;
    totalMessageSent: number;
    name: string;
    threadMetadata: ThreadMetadata;
    isArchivedLockedThread(): boolean;
}

export interface MessageCount {
    messageCount: number;
    messageCountText: string;
    unreadCount: number | null;
    unreadCountText: string | number | null;
}

export interface ForumPostState {
    isNew: boolean;
    hasUnreads: boolean;
    isActive: boolean;
    isMuted: boolean;
    hasJoined: boolean;
    hasOpened: boolean;
}

export interface DiscordTag {
    id: string;
    custom?: false;
    name: string;
    emojiId: null | string;
    emojiName: null | string;
    moderated: boolean;
}

export type CustomTagColor = "blue" | "green" | "red" | "teal" | "yellow" | "orange";

export interface CustomTag {
    id: string;
    name: string;
    custom: true;
    color?: CustomTagColor;
    icon?: ReactNode;
}
export type Tag = DiscordTag | CustomTag;

export interface CustomTagDefinition {
    id: CustomTag["id"];
    name: string | (() => string);
    icon?: () => ReactNode;
    condition: (channel: ThreadChannel, context: ForumPostState) => boolean;
    color?: CustomTag["color"];
}

export interface FullGuildMember extends GuildMember {
    avatarDecoration?: { asset: string; skuId: string };
    colorStrings?: Record<
        "primaryColor" | "secondaryColor" | "tertiaryColor",
        GuildMember["colorString"]
    >;
    colorRoleId?: string;
}

export interface FullUser extends User {
    global_name?: string;
    globalName?: string;
    primaryGuild?: Partial<{
        badge: string;
        identityEnabled: boolean;
        identityGuildId: string;
        tag: string;
    }>;
}

export type MessageReactionWithBurst = MessageReaction & { burst_count: number; me_burst: boolean };

export enum ReactionType {
    NORMAL = 0,
    BURST = 1,
    VOTE = 2,
}

export interface MessageFormattingOptions {
    message: Message | null;
    channel: Channel;
    content: ReactNode;
    hasMediaAttachment: boolean;
    isAuthorBlocked?: boolean;
    isAuthorIgnored?: boolean;
    className?: string;
    iconSize?: number;
    iconClassName?: string;
}

export interface Attachment {
    type: "embed" | "attachment";
    src: string;
    width: number;
    height: number;
    spoiler?: boolean;
    contentScanVersion?: number;
    isVideo?: boolean;
    isThumbnail?: boolean;
    attachmentId?: string;
    mediaIndex?: number;
    srcIsAnimated?: boolean;
    alt?: string;
}

export type EmojiSize = "reaction" | "jumbo";

export interface Member extends Partial<Omit<FullGuildMember, "avatar" | "avatarDecoration">> {
    colorRoleName?: string;
    guildMemberAvatar?: FullGuildMember["avatar"];
    guildMemberAvatarDecoration?: FullGuildMember["avatarDecoration"];
    primaryGuild?: FullUser["primaryGuild"];
}
