/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Emoji } from "@webpack/types";
import {
    Channel,
    Embed,
    GuildMember,
    Message,
    MessageAttachment,
    MessageReaction,
    User,
} from "discord-types/general";
import { ReactNode } from "react";

export interface FullChannel extends Channel {
    isForumLikeChannel(): this is ForumChannel;
    isForumChannel(): this is ForumChannel;
}

export interface ForumChannel extends FullChannel {
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

export interface CustomTag extends Omit<DiscordTag, "name"> {
    name?: string;
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
    message: FullMessage | null;
    className?: string;
    iconSize?: number;
    iconClassName?: string;
}

export interface Attachment {
    type: "embed" | "attachment" | "component";
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
    flags?: MessageAttachmentFlag;
    srcUnfurledMediaItem?: UnfurledMedia;
}

export interface FullMessage extends Omit<Message, "components"> {
    attachments: FullMessageAttachment[];
    embeds: FullEmbed[];
    components?: MessageComponent[];
}

export interface MessageComponent {
    id: number;
    type: MessageComponentType;
    components?: MessageComponent[];
    accessory?: MessageComponent;
    spoiler?: boolean;
    media?: UnfurledMedia;
    description?: string;
    items?: Pick<MessageComponent, "media" | "description" | "spoiler">[];
}

export interface UnfurledMedia
    extends Pick<FullMessageAttachment, "url" | "flags" | "width" | "height">,
        Pick<Image, "srcIsAnimated"> {
    proxyUrl: FullMessageAttachment["proxy_url"];
    contentType: FullMessageAttachment["content_type"];
    contentScanMetadata?: ContentScanMetadata;
    placeholder?: string;
    placeholderVersion?: number;
    loadingState?: number;
    original?: string;
    type?: string;
    sourceMetadata?: SourceMetadata;
}

export interface ContentScanMetadata {
    version: FullMessageAttachment["content_scan_version"];
    flags: number;
}

export interface SourceMetadata {
    message?: Message;
    identifier?: Partial<{
        type: string;
        attachmentId: string;
        filename: string;
        size: number;
    }>;
}

export enum MessageAttachmentFlag {
    IS_CLIP = 1 << 0,
    IS_THUMBNAIL = 1 << 1,
    IS_REMIX = 1 << 2,
    IS_SPOILER = 1 << 3,
    CONTAINS_EXPLICIT_MEDIA = 1 << 4,
    IS_ANIMATED = 1 << 5,
    CONTAINS_GORE_CONTENT = 1 << 6,
}

export interface FullMessageAttachment extends MessageAttachment {
    description?: string;
    flags?: MessageAttachmentFlag;
    content_scan_version?: number;
    placeholder?: string;
    placeholder_version?: number;
}

export interface FullEmbed extends Embed, Pick<Attachment, "flags" | "contentScanVersion"> {
    url: string;
    image: Image;
    images: Image[];
}

interface Image {
    url: string;
    proxyURL: string;
    width: number;
    height: number;
    srcIsAnimated: boolean;
    flags: number;
    contentType: string;
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

export enum MessageComponentType {
    ACTION_ROW = 1,
    BUTTON = 2,
    STRING_SELECT = 3,
    TEXT_INPUT = 4,
    USER_SELECT = 5,
    ROLE_SELECT = 6,
    MENTIONABLE_SELECT = 7,
    CHANNEL_SELECT = 8,
    SECTION = 9,
    TEXT_DISPLAY = 10,
    THUMBNAIL = 11,
    MEDIA_GALLERY = 12,
    FILE = 13,
    SEPARATOR = 14,
    CONTENT_INVENTORY_ENTRY = 16,
    CONTAINER = 17,
}
