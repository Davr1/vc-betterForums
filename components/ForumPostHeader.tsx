/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "discord-types/general";

import { cl } from "..";
import { useForumChannelState, useForumPostInfo } from "../utils";
import { MoreTags, Tag } from "./Tags";

interface ForumPostHeaderProps {
    channel: Channel;
    isNew?: boolean;
    tagsClassName?: string;
    className?: string;
}

export function ForumPostHeader({
    channel,
    isNew,
    tagsClassName,
    className,
}: ForumPostHeaderProps) {
    const { shownTags, remainingTags, moreTagsCount, isPinned, shouldRenderTagsRow } =
        useForumPostInfo({
            channel,
            isNew,
        });
    const { tagFilter } = useForumChannelState(channel.id);
    if (!shouldRenderTagsRow) return null;

    return (
        <div className={cl("tags", className)}>
            {isNew ? "new" : ""}
            {isPinned ? "pinned" : ""}
            {shownTags.map(tag => (
                <Tag
                    tag={tag}
                    className={cl(tagsClassName, { filtered: tagFilter.has(tag.id) })}
                    key={tag.id}
                    selected
                />
            ))}
            {moreTagsCount > 0 && <MoreTags tags={remainingTags} count={moreTagsCount} size={0} />}
        </div>
    );
}
