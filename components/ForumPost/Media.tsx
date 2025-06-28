/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { proxyLazyWebpack } from "@webpack";
import { React } from "@webpack/common";

import { useForumPostMetadata, useLazyImage } from "../../hooks";
import { FullMessage, UnfurledMediaItem } from "../../types";
import { _memo } from "../../utils";
import { Image } from "../Image";

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
                        imageClassName="vc-better-forums-thumbnail-override"
                    />
                ))}
            </div>
        </MediaContext.Provider>
    );
});

interface ImagePreviewProps {
    mediaIndex: number;
    imageClassName?: string;
}

function ImagePreview({ mediaIndex, imageClassName }: ImagePreviewProps) {
    const value = React.useContext(MediaContext);

    const props = useLazyImage(value?.media ?? [], mediaIndex);

    return <Image {...props} imageClassName={imageClassName} />;
}
