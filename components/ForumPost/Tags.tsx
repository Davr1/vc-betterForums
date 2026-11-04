/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback } from "@webpack/common";

import {
    useAppliedTags,
    useForumChannelState,
    useForumChannelStore,
} from "../../hooks";
import { MaxTagCount, settings } from "../../settings";
import { CustomTag, ThreadChannel } from "../../types";
import { _memo } from "../../utils";
import { TagsContextMenu } from "../ContextMenus/TagContextMenu";
import { MoreTags, Tag } from "../Tags";

interface TagsProps {
    channel: ThreadChannel;
    tagsClassName?: string;
}

export const Tags = _memo<TagsProps>(function Tags({ channel, tagsClassName }) {
    const { maxTagCount } = settings.use(["maxTagCount"]);

    const tags = useAppliedTags(channel);
    const { tagFilter } = useForumChannelState(channel.parent_id);

    const store = useForumChannelStore();
    const toggleTagFilter = useCallback(
        (_: unknown, tag: CustomTag) => store?.toggleTagFilter(channel.parent_id, tag.id),
        [channel.parent_id]
    );

    const renderTag = useCallback(
        (tag: CustomTag) => (
            <Tag
                tag={tag}
                className={tagsClassName}
                filtered={tagFilter.has(tag.id)}
                key={tag.id}
                onClick={tag.custom ? undefined : toggleTagFilter}
                onContextMenu={TagsContextMenu.open}
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
