/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
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
    BoundingBox,
    CustomTag,
    FullEmbed,
    FullMessage,
    FullMessageAttachment,
    MessageAttachmentFlag,
    MessageComponent,
    MessageComponentType,
    ParsedContent,
    Size,
    ThreadChannel,
    UnfurledMediaItem,
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

export function hasFlag(value: number | undefined | null, flag: number): boolean {
    return !!value && (value & flag) === flag;
}

export const imageRegex = /\.(png|jpe?g|webp|gif|heic|heif|dng|avif)$/i;
export const videoRegex = /\.(mp4|webm|mov)$/i;
export const animatedMediaRegex = /\.(webp|gif|avif)$/i;

export function isImage({ filename, height, width }: FullMessageAttachment): boolean {
    return imageRegex.test(filename) && !!height && !!width;
}

export function isVideo({ filename, proxy_url }: FullMessageAttachment): boolean {
    return videoRegex.test(filename) && !!proxy_url;
}

function isMedia(attachment: FullMessageAttachment | null) {
    if (!attachment) return false;
    return isImage(attachment) || isVideo(attachment);
}

function getEmbedMediaType(media: UnfurledMediaItem): UnfurledMediaItem["type"] {
    return matchesMimeType(media.contentType, "image")
        ? "IMAGE"
        : matchesMimeType(media.contentType, "video") && media.proxyUrl && parseUrl(media.proxyUrl)
        ? "VIDEO"
        : "INVALID";
}

export function matchesUrlSuffix(url: string | null | undefined, regex: RegExp) {
    if (!url) return false;
    const [cleanUrl] = url.split("?", 1);
    return regex.test(cleanUrl);
}

export function matchesMimeType(url: string | null | undefined, type: string) {
    if (!url) return false;
    const [parentType] = url.split("/");
    return parentType === type;
}

function defineParser<T>(
    type: Attachment["type"],
    fn: (first: T) => Omit<Attachment, "type"> | null
) {
    return (first: T, mediaIndex = 0, spoiler = false) => {
        const result = fn(first);
        return result ? { ...result, mediaIndex, type, spoiler } : null;
    };
}

const AttachmentParser = {
    fromMessageAttachment: defineParser<FullMessageAttachment>("attachment", attachment => {
        const {
            proxy_url,
            url,
            description,
            flags = 0,
            width,
            height,
            content_scan_version,
            content_type,
            placeholder,
            placeholder_version,
            ...rest
        } = attachment;

        if (!width || !height) return null;

        const isMediaVideo = isVideo(attachment);
        const isThumbnail = hasFlag(flags, MessageAttachmentFlag.IS_THUMBNAIL);

        let src = proxy_url || url;

        if (isMediaVideo) {
            const videoUrl = parseUrl(proxy_url);
            if (!videoUrl) return null;

            videoUrl.searchParams.append("format", "webp");
            src = videoUrl.toString();
        }

        return {
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
            contentType: content_type,
            srcUnfurledMediaItem: {
                proxyUrl: proxy_url,
                url,
                contentScanMetadata: { version: content_scan_version, flags },
                contentType: content_type,
                width,
                height,
                flags,
                original: url,
                placeholder,
                placeholderVersion: placeholder_version,
            },
        };
    }),
    fromEmbed: defineParser<FullEmbed>("embed", embed => {
        const embedImage = embed.image ?? embed.thumbnail ?? embed.images?.[0];
        if (!embedImage?.url) return null;

        const { proxyURL, url, ...rest } = embedImage;

        const src = proxyURL || url;
        const isVideo = !!src && matchesUrlSuffix(src, videoRegex);

        return {
            ...rest,
            src,
            contentScanVersion: embed.contentScanVersion,
            isVideo,
        };
    }),
    fromMedia: defineParser<UnfurledMediaItem>("component", media => {
        const type = getEmbedMediaType(media);
        if (type === "INVALID") return null;

        const { proxyUrl, width, height, contentScanMetadata, ...rest } = media;
        const contentScanVersion = media.contentScanMetadata?.version;
        const isVideo = type === "VIDEO";

        return {
            ...rest,
            src: proxyUrl,
            height: height ?? 0,
            width: width ?? 0,
            contentScanVersion,
            isVideo,
            srcUnfurledMediaItem: media,
        };
    }),
} as const;

function getComponentMap(
    components: MessageComponent[]
): Map<MessageComponent["id"], MessageComponent> {
    const map = new Map<MessageComponent["id"], MessageComponent>();
    for (const item of components) flattenComponent(map, item);
    return map;
}

function flattenComponent(
    map: Map<MessageComponent["id"], MessageComponent>,
    component: MessageComponent
) {
    map.set(component.id, component);

    switch (component.type) {
        case MessageComponentType.SECTION:
            flattenComponent(map, component.accessory!);
        // eslint-disable-next-line no-fallthrough
        case MessageComponentType.ACTION_ROW:
        case MessageComponentType.CONTAINER:
            component.components!.forEach(item => flattenComponent(map, item));
    }
}

export function getAttachments(attachments: FullMessage["attachments"]): Attachment[] {
    return attachments
        .filter(isMedia)
        .map((item, index) => AttachmentParser.fromMessageAttachment(item, index))
        .filter(Boolean) as Attachment[];
}

export function getEmbeds(embeds: FullMessage["embeds"], spoiler: boolean): Attachment[] {
    return embeds
        .map((embed, mediaIndex) => AttachmentParser.fromEmbed(embed, mediaIndex, spoiler))
        .filter(Boolean) as Attachment[];
}

export function getComponentMedia(components: FullMessage["components"]): Attachment[] {
    const map = getComponentMap(components);

    return Array.from(map.values())
        .flatMap(({ type, media, spoiler, items }) => {
            switch (type) {
                case MessageComponentType.THUMBNAIL:
                    return AttachmentParser.fromMedia(media!, 0, spoiler);
                case MessageComponentType.MEDIA_GALLERY:
                    return items!.map((item, index) =>
                        AttachmentParser.fromMedia(item.media!, index, item.spoiler)
                    );
                default:
                    return null;
            }
        })
        .filter(Boolean) as Attachment[];
}

export function unfurlAttachment(
    attachment: Attachment,
    message: FullMessage | null = null
): UnfurledMediaItem {
    const { flags = 0, isVideo, attachmentId, src, srcUnfurledMediaItem, ...rest } = attachment;

    return {
        ...rest,
        flags,
        src,
        url: src,
        proxyUrl: srcUnfurledMediaItem?.proxyUrl || src,
        original: srcUnfurledMediaItem?.original || src,
        srcIsAnimated: hasFlag(flags, MessageAttachmentFlag.IS_ANIMATED),
        type: isVideo ? "VIDEO" : "IMAGE",
        sourceMetadata: {
            message,
            identifier: attachmentId ? attachment : null,
        },
    };
}

export function hasVolume(size?: Partial<Size>): size is Size {
    return !!size && !!size.width && !!size.height;
}

function fitWithinBoundingBox({
    width,
    height,
    maxWidth = window.innerWidth,
    maxHeight = window.innerHeight,
    minWidth = 0,
    minHeight = 0,
}: BoundingBox): Size {
    if (width !== maxWidth || height !== maxHeight) {
        const wRatio = width > maxWidth ? maxWidth / width : 1;
        width = Math.max(Math.round(width * wRatio), minWidth);
        height = Math.max(Math.round(height * wRatio), minHeight);

        const hRatio = height > maxHeight ? maxHeight / height : 1;
        width = Math.max(Math.round(width * hRatio), minWidth);
        height = Math.max(Math.round(height * hRatio), minHeight);
    }

    return { width, height };
}

const buttonSize = 40;
const toolbar = Object.freeze({ width: 236, height: buttonSize });
const safezone = Object.freeze({ inline: 24, block: 36 });
const gap = 12;

export function getPreviewSize(hasMultiple: boolean, size: Partial<Size>): Size {
    const { innerWidth, innerHeight } = window;
    const widestPreview = {
        maxWidth: innerWidth - 2 * (safezone.inline + (hasMultiple ? buttonSize + gap : 0)),
        maxHeight: innerHeight - 2 * (safezone.block + toolbar.height + gap),
    };

    if (!hasVolume(size)) {
        return { width: widestPreview.maxWidth, height: widestPreview.maxHeight };
    }

    const tallestPreview = {
        maxWidth: innerWidth - 2 * (safezone.inline + toolbar.width + gap),
        maxHeight: innerHeight - 2 * (safezone.block + (hasMultiple ? toolbar.height + gap : 0)),
    };

    const widestFit = fitWithinBoundingBox({ ...size, ...widestPreview });
    const tallestFit = fitWithinBoundingBox({ ...size, ...tallestPreview });

    return widestFit.width >= tallestFit.width ? widestFit : tallestFit;
}
