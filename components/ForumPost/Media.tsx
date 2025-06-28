/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CSSProperties } from "react";

import { useForumPostMetadata, useLazyImage } from "../../hooks";
import { MaxMediaCount, settings } from "../../settings";
import { FullMessage, UnfurledMediaItem } from "../../types";
import { _memo } from "../../utils";
import { Image } from "../Image";

interface MediaProps {
    message: FullMessage | null;
}

export const Media = _memo<MediaProps>(function Media({ message }) {
    const { media } = useForumPostMetadata({ firstMessage: message });
    const { maxMediaCount, mediaSize } = settings.use(["maxMediaCount", "mediaSize"]);

    if (!message || media.length === 0 || maxMediaCount === MaxMediaCount.OFF) return null;

    const length =
        maxMediaCount === MaxMediaCount.ALL ? media.length : Math.min(maxMediaCount, media.length);

    return Array.from({ length }, (_, index) => (
        <MediaItem items={media} mediaIndex={index} key={index} prefferedSize={mediaSize} />
    ));
});

interface MediaItemProps {
    items: UnfurledMediaItem[];
    mediaIndex: number;
    prefferedSize?: number;
}

const MediaItem = _memo<MediaItemProps>(function MediaItem({
    items,
    mediaIndex = 0,
    prefferedSize,
}) {
    const props = useLazyImage({ items, mediaIndex, prefferedSize });

    return (
        <div
            onClick={e => e.stopPropagation()}
            style={
                {
                    "--forum-post-thumbnail-size": `${prefferedSize}px`,
                } as CSSProperties
            }
        >
            <Image
                {...props}
                className="vc-better-forums-thumbnail-container"
                imageClassName="vc-better-forums-thumbnail"
                shouldRenderAccessory
            />
        </div>
    );
});
