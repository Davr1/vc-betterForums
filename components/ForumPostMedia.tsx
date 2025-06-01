/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { useMemo, useStateFromStores, WindowStore } from "@webpack/common";

const MediaMosaic = findByCodeLazy("mediaMosaicAltTextPopoutDescription");

export function ForumPostMedia({ firstMedia }) {
    return (
        <div className={"bodyMedia"} onClick={e => e.stopPropagation()}>
            <MediaEmbed firstMedia={firstMedia} />
        </div>
    );
}

const animatedMediaRegex = /\.(webp|gif|avif)$/i;

function MediaEmbed({ firstMedia }) {
    const isFocused = useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const { src, width, height, alt } = firstMedia;
    const isAnimated = useMemo(() => !src || animatedMediaRegex.test(src.split(/\?/, 1)[0]), [src]);

    return (
        <MediaMosaic
            src={src}
            width={width}
            height={height}
            minWidth={72}
            minHeight={72}
            alt={alt}
            animated={isAnimated && isFocused}
            srcIsAnimated={firstMedia.srcIsAnimated}
            containerClassName={"thumbnailContainer"}
            imageClassName={"thumbnailOverride"}
        />
    );
}
