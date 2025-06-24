/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy, findByPropsLazy, proxyLazyWebpack } from "@webpack";
import { React, useCallback, useMemo, useStateFromStores, WindowStore } from "@webpack/common";

import { useForumPostMetadata } from "../../hooks";
import { FullMessage, UnfurledMediaItem } from "../../types";
import { _memo, animatedMediaRegex, matchesUrlSuffix } from "../../utils";

const MediaContext = proxyLazyWebpack(() =>
    React.createContext<{ message: FullMessage; media: UnfurledMediaItem[] } | null>(null)
);

interface MediaProps {
    message: FullMessage | null;
}

export const Media = _memo<MediaProps>(function Media({ message }) {
    const { media } = useForumPostMetadata({ firstMessage: message });
    if (!message || media.length === 0) return null;

    return (
        <MediaContext.Provider value={{ media, message }}>
            <div onClick={e => e.stopPropagation()}>
                {media.map((_, index) => (
                    <ImagePreview
                        mediaIndex={index}
                        key={index}
                        containerClassName="vc-better-forums-thumbnail-container"
                        imageClassName="vc-better-forums-thumbnail-override"
                    />
                ))}
            </div>
        </MediaContext.Provider>
    );
});

const Img = findByPropsLazy("preloadImage", "trackLoadingCompleted");
const openMediaViewer: (options: {
    items: Partial<UnfurledMediaItem>[];
    shouldHideMediaOptions?: boolean;
    location?: string;
    contextKey?: "default" | "popout";
    startingIndex?: number;
}) => void = findByCodeLazy("shouldHideMediaOptions", "LIGHTBOX");

interface ImagePreviewProps {
    mediaIndex: number;
    containerClassName?: string;
    imageClassName?: string;
}

function ImagePreview({ mediaIndex, containerClassName, imageClassName }: ImagePreviewProps) {
    const value = React.useContext(MediaContext);
    const image = value?.media[mediaIndex]!;

    const { url, width, height } = image;

    const isFocused = useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const isAnimated = useMemo(() => matchesUrlSuffix(url, animatedMediaRegex), [url]);

    const animated = isAnimated && isFocused;

    const onMouseEnter = useCallback(() => {
        Img.preloadImage({
            src: url,
            dimensions: {
                maxWidth: width,
                maxHeight: height,
                imageWidth: width,
                imageHeight: height,
            },
            options: {},
        });
    }, [image]);

    const onZoom = useCallback(
        e => {
            e.currentTarget instanceof Element && e.currentTarget.blur();

            openMediaViewer({
                items: value?.media ?? [],
                shouldHideMediaOptions: false,
                location: "LazyImageZoomable",
                contextKey: "default",
                startingIndex: mediaIndex,
            });
        },
        [image, mediaIndex, value?.media]
    );

    return (
        <Img
            onZoom={onZoom}
            onMouseEnter={onMouseEnter}
            shouldAnimate={animated}
            src={url}
            {...image}
            containerClassName={containerClassName}
            imageClassName={imageClassName}
        />
    );
}
