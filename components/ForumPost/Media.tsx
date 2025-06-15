/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo, useStateFromStores, WindowStore } from "@webpack/common";

import { Attachment } from "../../types";
import { _memo } from "../../utils";
import { MediaMosaic } from "../MediaMosaic";

interface MediaProps extends Attachment {}

const animatedMediaRegex = /\.(webp|gif|avif)$/i;

export const Media = _memo<MediaProps>(function Media({ src, width, height, alt, srcIsAnimated }) {
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
                containerClassName="vc-better-forums-thumbnail-container"
                imageClassName="vc-better-forums-thumbnail-override"
            />
        </div>
    );
});
