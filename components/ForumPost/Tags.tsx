/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback } from "@webpack/common";

import { cl } from "../..";
import { useForumChannelState, useTags } from "../../hooks";
import { MaxTagCount, settings } from "../../settings";
import { Tag as TagType, ThreadChannel } from "../../types";
import { _memo } from "../../utils";
import { MoreTags, Tag } from "../Tags";

interface TagsProps {
    channel: ThreadChannel;
    tagsClassName?: string;
}

export const Tags = _memo<TagsProps>(function Tags({ channel, tagsClassName }) {
    const { maxTagCount } = settings.use(["maxTagCount"]);

    const tags = useTags(channel);
    const { tagFilter } = useForumChannelState(channel.parent_id);

    const renderTag = useCallback(
        (tag: TagType) => (
            <Tag
                tag={tag}
                className={cl(tagsClassName, {
                    "vc-better-forums-tag-filtered": tagFilter.has(tag.id),
                })}
                key={tag.id}
            />
        ),
        [tagFilter]
    );

    if (tags.length === 0 || maxTagCount === MaxTagCount.OFF) return null;

    return [
        tags.slice(0, maxTagCount).map(renderTag),
        tags.length > maxTagCount && (
            <MoreTags tags={tags.slice(maxTagCount)} renderTag={renderTag} />
        ),
    ];
});
