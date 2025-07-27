/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    Channel,
    Embed,
    Emoji,
    GuildMember,
    Message,
    MessageAttachment,
    MessageReaction,
    User,
} from "@vencord/discord-types";
import { ReactNode, Ref } from "react";

import { RichEditorType } from "./components/RichEditor";

export interface FullChannel extends Channel {
    isForumLikeChannel(): this is ForumChannel;
    isForumChannel(): this is ForumChannel;
    isActiveThread(): this is ThreadChannel;
    isArchivedThread(): this is ThreadChannel;
    isThread(): this is ThreadChannel;
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

export interface ThreadChannel extends FullChannel {
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

export interface FullUser extends User {
    global_name?: string;
    primaryGuild?: Partial<{
        badge: string;
        identityEnabled: boolean;
        identityGuildId: string;
        tag: string;
    }>;
}

export type MessageReactionWithBurst = MessageReaction & { burst_count: number; me_burst: boolean };

export const enum ReactionType {
    NORMAL = 0,
    BURST = 1,
    VOTE = 2,
}

export interface MessageFormatterOptions {
    message: FullMessage | null;
    channelId: Channel["id"];
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
    contentType?: string;
    isVideo?: boolean;
    isThumbnail?: boolean;
    attachmentId?: string;
    mediaIndex?: number;
    alt?: string;
    flags?: MessageAttachmentFlag;
    srcUnfurledMediaItem?: UnfurledMediaItem;
}

export interface FullMessage extends Omit<Message, "components"> {
    attachments: FullMessageAttachment[];
    embeds: FullEmbed[];
    components: MessageComponent[];
    soundboardSounds?: string[];
    reactions: MessageReactionWithBurst[];
}

export interface MessageComponent {
    id: number;
    type: MessageComponentType;
    components?: MessageComponent[];
    accessory?: MessageComponent;
    spoiler?: boolean;
    media?: UnfurledMediaItem;
    description?: string;
    items?: Pick<MessageComponent, "media" | "description" | "spoiler">[];
}

export interface UnfurledMediaItem
    extends Pick<FullMessageAttachment, "url" | "flags" | "width" | "height"> {
    proxyUrl: FullMessageAttachment["proxy_url"];
    contentType?: FullMessageAttachment["content_type"];
    contentScanMetadata?: ContentScanMetadata;
    placeholder?: string;
    placeholderVersion?: number;
    loadingState?: number;
    original?: string;
    type?: "IMAGE" | "VIDEO" | "INVALID";
    sourceMetadata?: SourceMetadata;
    srcIsAnimated?: boolean;
    src?: string; // duplicate of url
    alt?: string;
}

export interface ContentScanMetadata {
    version: FullMessageAttachment["content_scan_version"];
    flags: number;
}

export interface SourceMetadata {
    message?: Message | null;
    identifier?: Partial<Attachment> | null;
}

export const enum MessageAttachmentFlag {
    NONE = 0,
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

export const enum EmbedType {
    IMAGE = "image",
    VIDEO = "video",
    LINK = "link",
    ARTICLE = "article",
    TWEET = "tweet",
    RICH = "rich",
    GIFV = "gifv",
    APPLICATION_NEWS = "application_news",
    AUTO_MODERATION_MESSAGE = "auto_moderation_message",
    AUTO_MODERATION_NOTIFICATION = "auto_moderation_notification",
    TEXT = "text",
    POST_PREVIEW = "post_preview",
    GIFT = "gift",
    SAFETY_POLICY_NOTICE = "safety_policy_notice",
    SAFETY_SYSTEM_NOTIFICATION = "safety_system_notification",
    AGE_VERIFICATION_SYSTEM_NOTIFICATION = "age_verification_system_notification",
    VOICE_CHANNEL = "voice_channel",
    GAMING_PROFILE = "gaming_profile",
    POLL_RESULT = "poll_result",
}

export interface FullEmbed extends Embed, Pick<Attachment, "flags" | "contentScanVersion"> {
    url: string;
    image: EmbedImage;
    images: EmbedImage[];
    type: EmbedType;
}

interface EmbedImage {
    url: string;
    proxyURL: string;
    width: number;
    height: number;
    srcIsAnimated: boolean;
    flags: number;
    contentType: string;
}

export type EmojiSize = "reaction" | "jumbo";

export interface Member extends Partial<Omit<GuildMember, "avatar" | "avatarDecoration">> {
    colorRoleName?: string;
    guildMemberAvatar?: GuildMember["avatar"];
    guildMemberAvatarDecoration?: GuildMember["avatarDecoration"];
    primaryGuild?: FullUser["primaryGuild"];
}

export interface ParsedContent {
    content: string;
    invalidEmojis: Emoji[];
    validNonShortcutEmojis: Emoji[];
    tts: boolean;
}

export const enum MessageComponentType {
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

export type Size = Record<"width" | "height", number>;
export type BoundingBox = Size & Partial<Record<`${"max" | "min"}${"Width" | "Height"}`, number>>;

export type TimeFormatterOptions = Record<
    "minutes" | "hours" | "days" | "month",
    string | (() => unknown)
>;

export interface LazyImageOptions {
    items: UnfurledMediaItem[];
    mediaIndex?: number;
    prefferedSize?: number | null;
}

export type RichEditorSubmit = Partial<{ shouldClear: boolean; shouldRefocus: boolean }> | void;

export interface RichEditorOptions {
    defaultValue?: string | null;
    handleChange?: (value: ParsedContent) => void;
    handleSubmit?: (value: ParsedContent) => RichEditorSubmit | Promise<RichEditorSubmit>;
    type?: Partial<RichEditorType>;
}

export interface ForumPostEventOptions {
    facepileRef?: Ref<HTMLElement>;
    goToThread: (channel: Channel, shiftKey: boolean) => void;
    channel: Channel;
}

export const enum ASTNodeType {
    TEXT = "text",
    STRIKETHROUGH = "s",
    UNDERLINE = "u",
    STRONG = "strong",
    ITALICS = "em",
    IMAGE = "image",
    EMOJI = "emoji",
    CUSTOM_EMOJI = "customEmoji",
    LINK = "link",
    URL = "url",
    AUTOLINK = "autolink",
    HIGHLIGHT = "highlight",
    PARAGRAPH = "paragraph",
    LINE_BREAK = "br",
    NEWLINE = "newline",
    ESCAPE = "escape",
    SPOILER = "spoiler",
    BLOCK_QUOTE = "blockQuote",
    INLINE_CODE = "inlineCode",
    CODE_BLOCK = "codeBlock",
    MENTION = "mention",
    CHANNEL_MENTION = "channelMention",
    CHANNEL = "channel",
    GUILD = "guild",
    ATTACHMENT_LINK = "attachmentLink",
    SHOP_LINK = "shopLink",
    SOUNDBOARD = "soundboard",
    STATIC_ROUTE_LINK = "staticRouteLink",
    ROLE_MENTION = "roleMention",
    COMMAND_MENTION = "commandMention",
    TIMESTAMP = "timestamp",
    LIST = "list",
    HEADING = "heading",
    SUBTEXT = "subtext",
    SILENT_PREFIX = "silentPrefix",
}

export interface ASTNode<T extends ASTNodeType = ASTNodeType> {
    type: T;
    content: string | ASTNode | ASTNode[];
    originalMatch?: RegExpExecArray;
}

export interface EmojiASTNode
    extends ASTNode<ASTNodeType.EMOJI | ASTNodeType.CUSTOM_EMOJI | ASTNodeType.SOUNDBOARD> {
    jumboable: boolean;
}

export interface LinkASTNode extends ASTNode<ASTNodeType.LINK> {
    target: string;
}

export interface ParagraphASTNode extends ASTNode<ASTNodeType.PARAGRAPH> {
    content: ASTNode[];
}

export interface ListASTNode extends ASTNode<ASTNodeType.LIST> {
    content: never;
    ordered: boolean;
    items: [ASTNode, ASTNode][];
    start?: number;
}

export type TitlePostProcessor = (match: ASTNode[], filters: Set<string>) => ASTNode[];

export interface MessageFormatOptions {
    message: FullMessage | null;
    formatInline?: boolean;
    noStyleAndInteraction?: boolean;
}

export interface ForumPostMetadata {
    hasSpoilerEmbeds?: boolean;
    content: ReactNode;
    media: UnfurledMediaItem[];
}

export interface ParserOptions {
    channelId?: Channel["id"];
    messageId?: Message["id"];
    allowLinks: boolean;
    allowDevLinks: boolean;
    formatInline: boolean;
    noStyleAndInteraction: boolean;
    allowHeading: boolean;
    allowList: boolean;
    previewLinkTarget: boolean;
    disableAnimatedEmoji: boolean;
    isInteracting: boolean;
    allowEmojiLinks: boolean;
    disableAutoBlockNewlines: boolean;
    mentionChannels: Channel["id"][];
    soundboardSounds?: string[];
    muted: boolean;
    unknownUserMentionPlaceholder: boolean;
    viewingChannelId?: Channel["id"];
    forceWhite: boolean;
}

export type ParseFn = (
    text: string,
    inline?: boolean,
    opts?: ParserOptions,
    postProcess?: (tree: ASTNode | ASTNode[], inline: boolean) => void
) => ReactNode;

export interface KeywordTrie {
    trie: Record<string, unknown>;
    search: (text: string) => Record<string, { start: number; end: number }>;
}

export type MessagePostProcessor = (
    tree: ASTNode[],
    inline: boolean,
    message: Partial<FullMessage>
) => ASTNode[] | void | null;

export interface MessageParserOptions extends Partial<ParserOptions> {
    postProcessor?: MessagePostProcessor;
    shouldFilterKeywords?: boolean;
    hideSimpleEmbedContent?: boolean;
    contentMessage?: FullMessage | null;
}

export interface SortedReaction {
    id: string;
    type: ReactionType;
    count: number;
    reaction: MessageReactionWithBurst;
}

export type TagOverrides = Record<CustomTag["id"], Partial<CustomTag>>;

export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type PartiallyRequired<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

export type OmitFromTuple<T extends readonly unknown[], K extends PropertyKey> = {
    [I in keyof T]: I extends keyof [] ? T[I] : Omit<RemoveIndex<T[I]>, K>;
};

export type RemoveIndex<T> = {
    [K in keyof T as string extends K
        ? never
        : number extends K
        ? never
        : symbol extends K
        ? never
        : K]: T[K];
};

export type Properties<T, TProp = unknown> = {
    [K in keyof T]-?: T[K] extends TProp | undefined ? K : never;
}[keyof T];
