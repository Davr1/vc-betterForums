/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { parseUrl } from "@utils/misc";

import {
    BoundingBox,
    EmbedType,
    FullEmbed,
    FullMessageAttachment,
    Size,
    UnfurledMediaItem,
} from "../types";

export const imageRegex = /\.(png|jpe?g|webp|gif|heic|heif|dng|avif)$/i;
export const videoRegex = /\.(mp4|webm|mov)$/i;
export const animatedMediaRegex = /\.(webp|gif|avif)$/i;

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

export function isImage({ filename, height, width }: FullMessageAttachment): boolean {
    return imageRegex.test(filename) && !!height && !!width;
}

export function isVideo({ filename, proxy_url }: FullMessageAttachment): boolean {
    return videoRegex.test(filename) && !!proxy_url;
}

export function isMedia(attachment: FullMessageAttachment | null) {
    if (!attachment) return false;
    return isImage(attachment) || isVideo(attachment);
}

export function getEmbedMediaType(media: UnfurledMediaItem): UnfurledMediaItem["type"] {
    return matchesMimeType(media.contentType, "image")
        ? "IMAGE"
        : matchesMimeType(media.contentType, "video") && media.proxyUrl && parseUrl(media.proxyUrl)
        ? "VIDEO"
        : "INVALID";
}

export function hasVolume(size?: Partial<Size>): size is Size {
    return !!size && !!size.width && !!size.height;
}

export function adjustSize(
    {
        width,
        height,
        maxWidth = window.innerWidth,
        maxHeight = window.innerHeight,
    }: Partial<Omit<BoundingBox, "minWidth" | "minHeight">>,
    mode: "fill" | "contain" | "cover" = "contain"
): Size {
    if (mode === "fill" || !hasVolume({ width, height }))
        return { width: maxWidth, height: maxHeight };

    const wRatio = maxWidth / width!;
    const hRatio = maxHeight / height!;
    const ratio = mode === "contain" ? Math.min(1, wRatio, hRatio) : Math.max(wRatio, hRatio);

    return {
        width: Math.round(width! * ratio),
        height: Math.round(height! * ratio),
    };
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

    const widestFit = adjustSize({ ...size, ...widestPreview }, "contain");
    const tallestFit = adjustSize({ ...size, ...tallestPreview }, "contain");

    return widestFit.width >= tallestFit.width ? widestFit : tallestFit;
}

const imageTypes = new Set([EmbedType.IMAGE, EmbedType.GIFV]);

export function isSimpleEmbedMedia({ image, video, type, author, rawTitle }: FullEmbed): boolean {
    if (!imageTypes.has(type)) return false;
    if (!image && !video) return false;

    return type === EmbedType.GIFV || (type !== EmbedType.RICH && !author && !rawTitle);
}
