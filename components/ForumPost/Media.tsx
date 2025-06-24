/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback, useMemo, useStateFromStores, WindowStore } from "@webpack/common";
import { Message } from "discord-types/general";
import { ComponentProps } from "react";

import { findByCodeLazy, findByPropsLazy } from "../../../../webpack";
import { Attachment } from "../../types";
import { _memo } from "../../utils";
import { MediaMosaic } from "../MediaMosaic";

interface MediaProps extends Attachment {}

const animatedMediaRegex = /\.(webp|gif|avif)$/i;

export const Media = _memo<MediaProps>(function Media({ src, width, height, alt, srcIsAnimated }) {
    const isFocused = useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const isAnimated = useMemo(() => !src || animatedMediaRegex.test(src.split(/\?/, 1)[0]), [src]);

    return (
        <div onClick={e => e.stopPropagation()}>
            <ImagePreview
                src={src}
                width={width}
                height={height}
                minWidth={72}
                minHeight={72}
                alt={alt}
                animated={isAnimated && isFocused}
                srcIsAnimated={srcIsAnimated}
                containerClassName="vc-better-forums-thumbnail-container"
                imageClassName="vc-better-forums-thumbnail-override"
            />
        </div>
    );
});

const Img = findByPropsLazy("preloadImage", "trackLoadingCompleted");
const MediaViewer = findByCodeLazy("shouldHideMediaOptions", "LIGHTBOX");

function ImagePreview(props: ComponentProps<typeof MediaMosaic>) {
    const onMouseEnter = useCallback(() => {
        Img.preloadImage({
            src: props.src,
            dimensions: {
                maxWidth: props.minWidth,
                maxHeight: props.minHeight,
                imageWidth: props.width,
                imageHeight: props.height,
            },
            options: props,
        });
    }, [props]);

    const onZoom = useCallback(e => {
        e.currentTarget instanceof Element && e.currentTarget.blur();

        MediaViewer({
            items: [
                {
                    url: props.src,
                    type: "IMAGE",
                    original: props.original ?? props.src,
                    ...props,
                },
            ],
            shouldHideMediaOptions: false,
            location: "LazyImageZoomable",
            contextKey: "default",
        });
    }, []);

    return (
        <Img
            onZoom={onZoom}
            onMouseEnter={onMouseEnter}
            shouldAnimate={props.animated}
            {...props}
        />
    );
}

interface MediaItem {
    url: string;
    proxyUrl: string;
    height: number;
    width: number;
    contentType: string;
    placeholder: string;
    placeholderVersion: number;
    loadingState: number;
    contentScanMetadata: ContentScanMetadata;
    flags: number;
    type: string;
    sourceMetadata: SourceMetadata;
    original: string;
    srcIsAnimated: boolean;
}

interface SourceMetadata {
    message: Message;
    identifier: Identifier;
}

interface Identifier {
    type: string;
    attachmentId: string;
    filename: string;
    size: number;
}

interface MessageAttachment extends Attachment {
    id: string;
    filename: string;
    size: number;
    url: string;
    proxy_url: string;
    width: number;
    height: number;
    content_type: string;
    content_scan_version: number;
    placeholder: string;
    placeholder_version: number;
    spoiler: boolean;
}

interface ContentScanMetadata {
    version: number;
    flags: number;
}
