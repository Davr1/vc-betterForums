/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { getUserSettingLazy } from "@api/UserSettings";
import { getIntlMessage } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { parseUrl } from "@utils/misc";
import { ModalAPI } from "@utils/modal";
import { findByProps, findByPropsLazy, proxyLazyWebpack } from "@webpack";
import { FluxDispatcher, IconUtils, React } from "@webpack/common";
import { CustomEmoji, UnicodeEmoji } from "@webpack/types";
import { Channel, Message } from "discord-types/general";
import { ComponentType } from "react";

import { Icons } from "./components/icons";
import {
    Attachment,
    CustomTag,
    FullEmbed,
    FullMessage,
    FullMessageAttachment,
    MessageAttachmentFlag,
    MessageComponent,
    MessageComponentType,
    ParsedContent,
    ThreadChannel,
    UnfurledMedia,
} from "./types";

export function indexedDBStorageFactory<T>() {
    return {
        async getItem(name: string): Promise<T | null> {
            return (await DataStore.get(name)) ?? null;
        },
        async setItem(name: string, value: T): Promise<void> {
            await DataStore.set(name, value);
        },
        async removeItem(name: string): Promise<void> {
            await DataStore.del(name);
        },
    };
}

export function _memo<TProps extends object = {}>(component: ComponentType<TProps>) {
    return LazyComponent(() => React.memo(component));
}

export const Kangaroo: {
    jumpToMessage: (options: {
        channelId: Channel["id"];
        messageId: Message["id"];
        flash?: boolean;
        jumpType?: "ANIMATED" | "INSTANT";
        skipLocalFetch?: boolean;
        isPreload?: boolean;
        avoidInitialScroll?: boolean;
    }) => void;
} = findByPropsLazy("jumpToMessage");

export const threadUtils: {
    joinThread(thread: ThreadChannel): void;
    leaveThread(thread: ThreadChannel): void;
} = findByPropsLazy("joinThread", "leaveThread");

const EmojiUtils: {
    getURL: (emojiName: UnicodeEmoji["name"]) => UnicodeEmoji["url"];
} = findByPropsLazy("getURL", "applyPlatformToThemedEmojiColorPalette");

export function getEmojiURL(
    { name, id }: { name?: UnicodeEmoji["name"] | null; id?: CustomEmoji["id"] | null },
    size: number = 48
): string | null {
    if (id) return IconUtils.getEmojiURL({ id, animated: false, size });
    if (name) return EmojiUtils.getURL(name);
    return null;
}

export const tagDefinitions = proxyLazyWebpack(() => {
    const tags = [
        {
            id: "new",
            name: getIntlMessage("NEW"),
            condition: ({ isNew }) => isNew,
            color: "blue",
        },
        {
            id: "pinned",
            name: getIntlMessage("PINNED_POST"),
            icon: Icons.Pin,
            condition: ({ isPinned }) => isPinned,
            color: "blue",
        },
        {
            id: "archived",
            name: getIntlMessage("THREAD_BROWSER_ARCHIVED"),
            info: "Post is older than 30 days",
            icon: Icons.Scroll,
            condition: ({ isActive }) => !isActive,
            color: "neutral",
        },
        {
            id: "locked",
            name: "Locked",
            icon: Icons.Lock,
            condition: ({ isLocked }) => isLocked,
            color: "orange",
        },
        {
            id: "abandoned",
            name: "Abandoned",
            info: "Original poster left the server",
            icon: Icons.None,
            condition: ({ isAbandoned }) => isAbandoned,
            color: "red",
        },
    ] as const;

    return tags.map(tag => ({
        ...tag,
        icon: "icon" in tag ? <tag.icon size={14} /> : null,
        custom: true,
    })) satisfies CustomTag[];
});

export const dummyChannel: Channel = proxyLazyWebpack(() => {
    const DmChannel: Channel & { new (base?: Partial<Channel>): Channel } = findByProps(
        "fromServer",
        "sortRecipients"
    );

    return Object.freeze(new DmChannel({ id: "0" }));
});

export const MessageParserUtils: {
    parse: (channel: Channel, content: string) => ParsedContent;
} = findByPropsLazy("parsePreprocessor", "unparse", "parse");

export type Merger<T extends object> = {
    [K in keyof T]?: boolean | ((p1: T[K], p2: T[K], objs: [T, T]) => boolean);
};

export function diffObjects<T extends object, TMerged extends boolean = false>(
    obj1: T,
    obj2: Partial<T>,
    merger: Merger<T>,
    returnMerged?: TMerged
): TMerged extends true ? T : Partial<T> {
    const mergerKeys = new Set(Reflect.ownKeys(merger));
    const keys = new Set([...Reflect.ownKeys(obj1), ...Reflect.ownKeys(obj2)]);

    const obj = (returnMerged ? { ...obj1 } : {}) as ReturnType<typeof diffObjects<T, TMerged>>;
    for (const key of keys.intersection(mergerKeys)) {
        if (
            typeof merger[key] === "boolean"
                ? merger[key]
                : merger[key]?.(obj1[key], obj2[key], [obj1, obj2])
        )
            obj[key] = obj2[key];
    }
    return obj;
}

export function closeAllScreens(): void {
    ModalAPI.closeAllModals();
    FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
}

export function hasFlag(value: number, flag: number): boolean {
    return (value & flag) === flag;
}

const imageRegex = /\.(png|jpe?g|webp|gif|heic|heif|dng|avif)$/i;
function isImage({ filename, height, width }: FullMessageAttachment): boolean {
    return imageRegex.test(filename) && !!height && !!width;
}

const videoRegex = /\.(mp4|webm|mov)$/i;
function isVideo({ filename, proxy_url }: FullMessageAttachment): boolean {
    return videoRegex.test(filename) && !!proxy_url;
}

function isMedia(attachment: FullMessageAttachment | null) {
    if (!attachment) return false;
    return isImage(attachment) || isVideo(attachment);
}

const inlineAttachmentMedia = getUserSettingLazy<boolean>("textAndImages", "inlineAttachmentMedia");
const inlineEmbedMedia = getUserSettingLazy<boolean>("textAndImages", "inlineEmbedMedia");
const renderEmbeds = getUserSettingLazy<boolean>("textAndImages", "renderEmbeds");

function parseMessageAttachment(
    attachment: FullMessageAttachment,
    mediaIndex: number = 0
): Attachment | null {
    const { proxy_url, url, description, flags, width, height, content_scan_version, ...rest } =
        attachment;

    if (!width || !height) return null;

    const isMediaVideo = isVideo(attachment);
    const isThumbnail = hasFlag(flags ?? 0, MessageAttachmentFlag.IS_THUMBNAIL);
    const srcIsAnimated = hasFlag(flags ?? 0, MessageAttachmentFlag.IS_ANIMATED);

    let src = proxy_url || url;

    if (isMediaVideo) {
        const videoUrl = parseUrl(proxy_url);
        if (!videoUrl) return null;

        videoUrl.searchParams.append("format", "webp");
        src = videoUrl.toString();
    }

    return {
        type: "attachment",
        ...rest,
        src,
        width,
        height,
        flags,
        contentScanVersion: content_scan_version,
        alt: description,
        isVideo: isMediaVideo,
        isThumbnail,
        attachmentId: attachment.id,
        mediaIndex,
        srcIsAnimated,
    };
}

function getAttachments(message: FullMessage | null, inlineAttachmentMedia: boolean): Attachment[] {
    if (!inlineAttachmentMedia || !message?.attachments) return [];

    return message.attachments
        .filter(isMedia)
        .map(parseMessageAttachment)
        .filter(Boolean) as Attachment[];
}

const matchesUrlSuffix = (url: string | null | undefined, regex: RegExp) => {
    if (!url) return false;
    const [cleanUrl] = url.split(/\?/, 1);
    return regex.test(cleanUrl);
};

function parseEmbed(
    embed: FullEmbed,
    mediaIndex: number = 0,
    spoiler?: boolean
): Attachment | null {
    const embedImage = embed.image ?? embed.thumbnail ?? embed.images?.[0];
    if (!embedImage.url) return null;

    const { proxyURL, url, flags, ...rest } = embedImage;
    const src = proxyURL || url;
    const isVideo = !!proxyURL && matchesUrlSuffix(proxyURL, videoRegex);
    const srcIsAnimated = hasFlag(flags ?? 0, MessageAttachmentFlag.IS_ANIMATED);

    return {
        type: "embed",
        ...rest,
        src,
        spoiler,
        flags: embed.flags,
        contentScanVersion: embed.contentScanVersion,
        isVideo,
        mediaIndex,
        srcIsAnimated,
    };
}

function getEmbeds(
    message: FullMessage | null,
    spoiler: boolean,
    inlineEmbedMedia: boolean,
    renderEmbeds: boolean
): Attachment[] {
    if (!renderEmbeds || !inlineEmbedMedia || !message?.embeds) return [];

    return message.embeds
        .map((embed, mediaIndex) => parseEmbed(embed, mediaIndex, spoiler))
        .filter(Boolean) as Attachment[];
}

function getComponentMap(
    components: MessageComponent[]
): Map<MessageComponent["id"], MessageComponent> {
    const map = new Map<MessageComponent["id"], MessageComponent>();
    for (const item of components) flatten(map, item);
    return map;
}

function flatten(map: Map<MessageComponent["id"], MessageComponent>, component: MessageComponent) {
    map.set(component.id, component);

    switch (component.type) {
        case MessageComponentType.SECTION:
            flatten(map, component.accessory!);
        // eslint-disable-next-line no-fallthrough
        case MessageComponentType.ACTION_ROW:
        case MessageComponentType.CONTAINER:
            component.components!.forEach(item => flatten(map, item));
    }
}

function getComponentMedia(message: FullMessage, inlineEmbedMedia: boolean) {
    if (!inlineEmbedMedia || !message?.components) return [];

    const map = getComponentMap(message.components);

    return Array.from(map.values())
        .flatMap(({ type, media, spoiler, items }) => {
            switch (type) {
                case MessageComponentType.THUMBNAIL:
                    return parseComponent(media!, 0, spoiler);
                case MessageComponentType.MEDIA_GALLERY:
                    return items!.map((item, index) =>
                        parseComponent(item.media!, index, item.spoiler)
                    );
                default:
                    return null;
            }
        })
        .filter(Boolean);
}

const matchesMimeType = (url: string | null | undefined, type: string) => {
    if (!url) return false;
    const [parentType] = url.split("/");
    return parentType === type;
};

function getEmbedMediaType(media: UnfurledMedia): "IMAGE" | "VIDEO" | "INVALID" {
    return matchesMimeType(media.contentType, "image")
        ? "IMAGE"
        : matchesMimeType(media.contentType, "video") && media.proxyUrl && parseUrl(media.proxyUrl)
        ? "VIDEO"
        : "INVALID";
}

function parseComponent(
    media: UnfurledMedia,
    mediaIndex: number = 0,
    spoiler?: boolean
): Attachment | null {
    const type = getEmbedMediaType(media);
    if (type === "INVALID") return null;

    const contentScanVersion = media.contentScanMetadata?.version;
    const srcIsAnimated = hasFlag(media.flags ?? 0, MessageAttachmentFlag.IS_ANIMATED);
    const isVideo = type === "VIDEO";

    return {
        type: "component",
        src: media.proxyUrl,
        height: media.height ?? 0,
        width: media.width ?? 0,
        spoiler: spoiler,
        contentScanVersion,
        srcIsAnimated,
        isVideo,
        mediaIndex: 0,
        srcUnfurledMediaItem: media,
    };
}
// function N(message, forumChannel, spoiler) {
//     let allMedia = getAllMedia(message, spoiler);
//     return r.useMemo(() => {
//         if (!forumChannel) return [];
//         if (!forumChannel.isMediaChannel()) return allMedia;
//         let firstMedia = allMedia.find(e => e.isThumbnail);
//         return firstMedia ? [firstMedia] : allMedia;
//     }, [forumChannel, allMedia]);
// }
export function getAllMedia(message: FullMessage, spoiler: boolean = false) {
    const inlineAttachmentMediaVisible = !!inlineAttachmentMedia?.getSetting();
    const inlineEmbedMediaVisible = !!inlineEmbedMedia?.getSetting();
    const shouldRenderEmbeds = !!renderEmbeds?.getSetting();

    const attachments = getAttachments(message, inlineAttachmentMediaVisible);
    const embeds = getEmbeds(message, spoiler, inlineEmbedMediaVisible, shouldRenderEmbeds);
    const componentMedia = getComponentMedia(message, inlineEmbedMediaVisible);

    return [...attachments, ...embeds, ...componentMedia];
}
