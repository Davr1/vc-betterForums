/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { parseUrl } from "@utils/misc";
import { lodash } from "@webpack/common";

import {
    Attachment,
    FullEmbed,
    FullMessage,
    FullMessageAttachment,
    MessageAttachmentFlag,
    MessageComponent,
    MessageComponentType,
    UnfurledMediaItem,
} from "../types";
import {
    getEmbedMediaType,
    hasFlag,
    hasVolume,
    isMedia,
    isVideo,
    matchesUrlSuffix,
    videoRegex,
} from "./";

function getThumbnail(
    attachment: FullMessageAttachment
): Pick<Attachment, "src" | "isThumbnail" | "isVideo"> | null {
    if (!hasVolume(attachment)) return null;

    const isMediaVideo = isVideo(attachment);
    const isThumbnail = hasFlag(attachment.flags, MessageAttachmentFlag.IS_THUMBNAIL);

    let src = attachment.proxy_url || attachment.url;

    if (isMediaVideo) {
        const videoUrl = parseUrl(attachment.proxy_url);
        if (!videoUrl) return null;

        videoUrl.searchParams.append("format", "webp");
        src = videoUrl.toString();
    }

    return { src, isVideo: isMediaVideo, isThumbnail };
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

export const AttachmentParser = {
    fromMessageAttachment: defineParser<FullMessageAttachment>("attachment", attachment => {
        const {
            id: attachmentId,
            proxy_url: proxyUrl,
            url,
            description: alt,
            content_scan_version: contentScanVersion,
            content_type: contentType,
            placeholder,
            placeholder_version: placeholderVersion,
            ...rest
        } = attachment;

        const thumbnail = getThumbnail(attachment);
        if (!thumbnail) return null;

        const common = lodash(attachment)
            .pick(["flags", "width", "height"])
            .defaults({ width: 0, height: 0, flags: 0 })
            .value();

        const srcUnfurledMediaItem: UnfurledMediaItem = {
            ...common,
            proxyUrl,
            url,
            contentScanMetadata: { version: contentScanVersion, flags: 0 },
            contentType,
            original: url,
            placeholder,
            placeholderVersion,
        };

        return {
            ...rest,
            ...thumbnail,
            ...common,
            contentScanVersion,
            alt,
            attachmentId,
            contentType,
            srcUnfurledMediaItem,
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
    components.forEach(flattenComponent);
    return map;

    function flattenComponent(component: MessageComponent) {
        map.set(component.id, component);

        switch (component.type) {
            case MessageComponentType.SECTION:
                flattenComponent(component.accessory!);
            // eslint-disable-next-line no-fallthrough
            case MessageComponentType.ACTION_ROW:
            case MessageComponentType.CONTAINER:
                component.components!.forEach(flattenComponent);
        }
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
