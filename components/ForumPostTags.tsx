/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { cl } from "..";
import { ThreadChannel, useForumChannelState, useForumPostInfo } from "../utils";
import { MoreTags, Tag } from "./Tags";

interface ForumPostTagsProps {
    channel: ThreadChannel;
    isNew?: boolean;
    tagsClassName?: string;
    className?: string;
}

export function ForumPostTags({ channel, isNew, tagsClassName }: ForumPostTagsProps) {
    const { shownTags, remainingTags, moreTagsCount, isPinned, shouldRenderTagsRow } =
        useForumPostInfo({ channel, isNew });

    const { tagFilter } = useForumChannelState(channel.id);
    if (!shouldRenderTagsRow) return null;

    return (
        <>
            {isNew ? "new" : ""}
            {isPinned ? "pinned" : ""}
            {shownTags.map(tag => (
                <Tag
                    tag={tag}
                    className={cl("vc-better-forums-tag", tagsClassName, {
                        "vc-better-forums-tag-filtered": tagFilter.has(tag.id),
                    })}
                    key={tag.id}
                />
            ))}
            {moreTagsCount > 0 && <MoreTags tags={remainingTags} count={moreTagsCount} />}
        </>
    );
}
