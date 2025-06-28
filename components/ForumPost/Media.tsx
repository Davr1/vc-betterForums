/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@webpack/common";
import { CSSProperties, Ref } from "react";

import { useForumPostMetadata, useLazyImage } from "../../hooks";
import { MaxMediaCount, settings } from "../../settings";
import { FullMessage, UnfurledMediaItem } from "../../types";
import { _memo } from "../../utils";
import { DynamicList } from "../DynamicList";
import { Image } from "../Image";

interface MediaProps {
    message: FullMessage | null;
    maxWidth?: number;
}

export const Media = _memo<MediaProps>(function Media({ message, maxWidth }) {
    const { media } = useForumPostMetadata({ firstMessage: message });
    const { maxMediaCount, mediaSize } = settings.use(["maxMediaCount", "mediaSize"]);

    if (!message || media.length === 0 || maxMediaCount === MaxMediaCount.OFF) return null;

    return (
        <DynamicList
            items={media}
            maxCount={maxMediaCount === MaxMediaCount.ALL ? undefined : maxMediaCount}
            maxWidth={maxWidth}
            gap={6}
            direction={Flex.Direction.HORIZONTAL_REVERSE}
        >
            {(_, ref: Ref<HTMLDivElement>, index) => (
                <MediaItem items={media} mediaIndex={index} prefferedSize={mediaSize} ref={ref} />
            )}
        </DynamicList>
    );
});

interface MediaItemProps {
    items: UnfurledMediaItem[];
    mediaIndex: number;
    prefferedSize?: number;
    ref?: Ref<HTMLDivElement>;
}

const MediaItem = _memo<MediaItemProps>(function MediaItem({
    items,
    mediaIndex = 0,
    prefferedSize,
    ref,
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
            ref={ref}
        >
            <Image
                {...props}
                className="vc-better-forums-thumbnail-container"
                imageClassName="vc-better-forums-thumbnail"
            />
        </div>
    );
});
