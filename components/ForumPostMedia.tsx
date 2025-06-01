/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { useMemo, useStateFromStores, WindowStore } from "@webpack/common";

export interface Attachment {
    type: "embed" | "attachment";
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
}

interface MediaMosaicProps {
    src: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    alt?: string;
    animated?: boolean;
    srcIsAnimated?: boolean;
    containerClassName?: string;
    imageClassName?: string;
}

const MediaMosaic = findComponentByCodeLazy<MediaMosaicProps>(
    "mediaMosaicAltTextPopoutDescription"
);

interface ForumPostMediaProps extends Attachment {}

const animatedMediaRegex = /\.(webp|gif|avif)$/i;

export function ForumPostMedia({ src, width, height, alt, srcIsAnimated }: ForumPostMediaProps) {
    const isFocused = useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const isAnimated = useMemo(() => !src || animatedMediaRegex.test(src.split(/\?/, 1)[0]), [src]);

    return (
        <div className={"bodyMedia"} onClick={e => e.stopPropagation()}>
            <MediaMosaic
                src={src}
                width={width}
                height={height}
                minWidth={72}
                minHeight={72}
                alt={alt}
                animated={isAnimated && isFocused}
                srcIsAnimated={srcIsAnimated}
                containerClassName={"thumbnailContainer"}
                imageClassName={"thumbnailOverride"}
            />
        </div>
    );
}
