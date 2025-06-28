/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useForumPostMetadata, useLazyImage } from "../../hooks";
import { FullMessage } from "../../types";
import { _memo } from "../../utils";
import { Image } from "../Image";

interface MediaProps {
    message: FullMessage | null;
}

export const Media = _memo<MediaProps>(function Media({ message }) {
    const { media } = useForumPostMetadata({ firstMessage: message });

    const props = useLazyImage({ items: media, mediaIndex: 0, prefferedSize: 72 });

    if (!message || media.length === 0) return null;

    return (
        <div onClick={e => e.stopPropagation()}>
            <Image
                {...props}
                className="vc-better-forums-thumbnail-container"
                imageClassName="vc-better-forums-thumbnail"
            />
        </div>
    );
});
