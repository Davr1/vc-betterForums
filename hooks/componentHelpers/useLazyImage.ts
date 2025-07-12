/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback, useMemo, WindowStore } from "@webpack/common";

import { Image, ImageProps, MediaLayoutType } from "../../components/Image";
import { LazyImageOptions, UnfurledMediaItem } from "../../types";
import {
    adjustSize,
    animatedMediaRegex,
    getPreviewSize,
    matchesUrlSuffix,
    openMediaViewer,
} from "../../utils";
import { useStores } from "../misc/useStores";

export function useLazyImage({ items, prefferedSize, mediaIndex = 0 }: LazyImageOptions) {
    const image: UnfurledMediaItem | undefined = items[mediaIndex];

    const isFocused = useStores([WindowStore], $ => $.isFocused());
    const isAnimated = useMemo(
        () => !!image?.url && matchesUrlSuffix(image.url, animatedMediaRegex),
        [image?.url]
    );

    const animated = isAnimated && isFocused;

    const onMouseEnter: ImageProps["onMouseEnter"] = useCallback(() => {
        if (image?.type !== "IMAGE") return;
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

    const size = useMemo(() => {
        if (!prefferedSize) return null;

        const { width, height } = adjustSize(
            { ...image, maxWidth: prefferedSize, maxHeight: prefferedSize },
            "cover"
        );

        return { maxWidth: width, maxHeight: height };
    }, [prefferedSize, image?.width, image?.height]);

    return {
        ...image,
        ...size,
        onMouseEnter,
        onZoom,
        mediaLayoutType: prefferedSize ? MediaLayoutType.RESPONSIVE : MediaLayoutType.STATIC,
    } as const satisfies ImageProps;
}
