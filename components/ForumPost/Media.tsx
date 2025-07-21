/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { TextProps } from "@vencord/discord-types";
import { Flex, Text, Tooltip, useCallback } from "@webpack/common";
import { CSSProperties, Ref } from "react";

import { cl } from "../..";
import { useLazyImage, useMessage } from "../../hooks";
import { MaxMediaCount, settings } from "../../settings";
import { FullMessage, UnfurledMediaItem } from "../../types";
import { _memo } from "../../utils";
import { DynamicList } from "../DynamicList";
import { Icons } from "../icons";
import { Image } from "../Image";

interface MediaProps {
    message: FullMessage | null;
    maxWidth?: number;
}

export const Media = _memo<MediaProps>(function Media({ message, maxWidth }) {
    const { media } = useMessage({ message });
    const { maxMediaCount, mediaSize } = settings.use(["maxMediaCount", "mediaSize"]);

    const { onMouseEnter, onZoom } = useLazyImage({ items: media });
    const renderFallback = useCallback(
        () => (
            <Tooltip text="View media">
                {props => (
                    <MediaCount
                        count={media.length}
                        {...props}
                        onMouseEnter={e => {
                            onMouseEnter(e);
                            props.onMouseEnter();
                        }}
                        onClick={e => {
                            e.stopPropagation();
                            onZoom(e);
                        }}
                    />
                )}
            </Tooltip>
        ),
        [media, onMouseEnter, onZoom]
    );

    if (!message || media.length === 0) return null;

    return (
        <DynamicList
            items={media}
            maxCount={maxMediaCount === MaxMediaCount.ALL ? undefined : maxMediaCount}
            maxWidth={maxWidth}
            direction={Flex.Direction.HORIZONTAL_REVERSE}
            renderFallback={renderFallback}
        >
            {(_, ref: Ref<HTMLDivElement>, index, max) => (
                <MediaItem
                    items={media}
                    mediaIndex={index}
                    prefferedSize={mediaSize}
                    ref={ref}
                    extraCount={index === 0 ? Math.max(media.length - max, 0) : 0}
                />
            )}
        </DynamicList>
    );
});

interface MediaItemProps {
    items: UnfurledMediaItem[];
    mediaIndex: number;
    prefferedSize?: number | null;
    extraCount?: number | null;
    ref?: Ref<HTMLDivElement>;
}

const MediaItem = _memo<MediaItemProps>(function MediaItem({
    items,
    mediaIndex = 0,
    prefferedSize,
    extraCount = 0,
    ref,
}) {
    const props = useLazyImage({ items, mediaIndex, prefferedSize });
    const style = prefferedSize
        ? ({
              "--forum-post-thumbnail-size": `${prefferedSize}px`,
          } as CSSProperties)
        : {};

    return (
        <div
            className="vc-better-forums-media-item"
            onClick={e => e.stopPropagation()}
            style={style}
            ref={ref}
        >
            <Image
                {...props}
                className="vc-better-forums-thumbnail-container"
                imageClassName="vc-better-forums-thumbnail"
            />
            <MediaCount
                count={extraCount}
                className="vc-better-forums-thumbnail-decorator-overlay"
                variant="text-sm/semibold"
                color="text-primary"
                isExtra
                displayIcon={!prefferedSize || prefferedSize > 48}
            />
        </div>
    );
});

interface MediaCountProps extends TextProps {
    count?: number | null;
    isExtra?: boolean;
    displayIcon?: boolean;
}

const MediaCount = _memo<MediaCountProps>(function MediaCount({
    count,
    className,
    isExtra,
    displayIcon = true,
    ...props
}) {
    if (!count) return null;

    return (
        <Text
            variant="text-sm/normal"
            className={cl("vc-better-forums-thumbnail-decorator", className)}
            {...props}
        >
            {isExtra ? "+" : null}
            {count}
            {displayIcon && <Icons.Image size="1em" />}
        </Text>
    );
});
