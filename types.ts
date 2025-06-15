/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Emoji } from "@webpack/types";
import { Channel, GuildMember, Message, MessageReaction, User } from "discord-types/general";
import { ReactNode } from "react";

export interface FullChannel extends Channel {
    isForumLikeChannel(): this is ForumChannel;
    isForumChannel(): this is ForumChannel;
}

export interface ForumChannel extends Channel {
    defaultReactionEmoji: Record<"emojiId" | "emojiName", string | null> | null;
    availableTags: DiscordTag[];
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

export type ForumPostState = Record<
    | "isNew"
    | "hasUnreads"
    | "isActive"
    | "isMuted"
    | "hasJoined"
    | "hasOpened"
    | "isLocked"
    | "isAbandoned"
    | "isPinned",
    boolean
>;

export interface DiscordTag {
    id: string;
    name: string;
    emojiId?: null | string;
    emojiName?: null | string;
}

export type CustomTagColor =
    | "neutral"
    | "pink"
    | "blurple"
    | "blue"
    | "teal"
    | "green"
    | "yellow"
    | "orange"
    | "red";

export interface CustomTag extends DiscordTag {
    info?: string;
    custom?: boolean;
    color?: CustomTagColor | null;
    invertedColor?: boolean;
    icon?: string | ReactNode;
    monochromeIcon?: boolean;
    condition?: (context: ForumPostState) => boolean;
    channelId?: Channel["id"];
    disabled?: boolean;
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

export interface ParsedContent {
    content: string;
    invalidEmojis: Emoji[];
    validNonShortcutEmojis: Emoji[];
    tts: boolean;
}
