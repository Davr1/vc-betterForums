/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { useCallback, useMemo, useStateFromStores, WindowStore } from "@webpack/common";

import { Image, ImageProps, MediaLayoutType } from "../components/Image";
import { UnfurledMediaItem } from "../types";
import { animatedMediaRegex, getPreviewSize, hasVolume, matchesUrlSuffix } from "../utils";

const openMediaViewer: (options: {
    items: Partial<UnfurledMediaItem>[];
    shouldHideMediaOptions?: boolean;
    location?: string;
    contextKey?: "default" | "popout";
    startingIndex?: number;
}) => void = findByCodeLazy("shouldHideMediaOptions", "LIGHTBOX");

interface LazyImageOptions {
    items: UnfurledMediaItem[];
    mediaIndex: number;
    prefferedSize?: number | null;
}

export function useLazyImage({ items, prefferedSize, mediaIndex = 0 }: LazyImageOptions) {
    const image: UnfurledMediaItem | undefined = items[mediaIndex];

    const isFocused = useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const isAnimated = useMemo(
        () => !!image?.url && matchesUrlSuffix(image.url, animatedMediaRegex),
        [image?.url]
    );

    const animated = isAnimated && isFocused;

    const onMouseEnter: ImageProps["onMouseEnter"] = useCallback(() => {
        if (!image) return;
        const previewSize = getPreviewSize(items.length > 1, image);

        Image.preloadImage({
            src: image.url,
            dimensions: {
                maxWidth: previewSize.width,
                maxHeight: previewSize.height,
                imageWidth: image.width,
                imageHeight: image.height,
            },
            options: { ...image, animated },
        });
    }, [image, animated]);

    const onZoom: ImageProps["onZoom"] = useCallback(
        event => {
            if (!image) return;
            event.currentTarget?.blur?.();

            openMediaViewer({
                items,
                shouldHideMediaOptions: false,
                location: "LazyImageZoomable",
                contextKey: "default",
                startingIndex: mediaIndex,
            });
        },
        [image, mediaIndex, items]
    );

    const size = !prefferedSize
        ? null
        : !hasVolume(image)
        ? { maxWidth: prefferedSize, maxHeight: prefferedSize }
        : image.width > image.height
        ? { maxHeight: prefferedSize }
        : { maxWidth: prefferedSize };

    return {
        ...image,
        ...size,
        onMouseEnter,
        onZoom,
        mediaLayoutType: prefferedSize ? MediaLayoutType.RESPONSIVE : MediaLayoutType.STATIC,
    } as const satisfies ImageProps;
}
