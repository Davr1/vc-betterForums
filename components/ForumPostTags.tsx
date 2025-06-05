/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage, getIntlMessageFromHash } from "@utils/discord";
import { PinIcon } from "userplugins/betterForums/components/icons";

import { cl } from "..";
import { ThreadChannel, useForumChannelState, useForumPostInfo } from "../utils";
import { CustomTag, MoreTags, Tag } from "./Tags";

interface ForumPostTagsProps {
    channel: ThreadChannel;
    isNew?: boolean;
    tagsClassName?: string;
    className?: string;
}

export function ForumPostTags({ channel, isNew, tagsClassName }: ForumPostTagsProps) {
    const { shownTags, remainingTags, moreTagsCount, isPinned, shouldRenderTagsRow } =
        useForumPostInfo({ channel, isNew });

    const { tagFilter } = useForumChannelState(channel.parent_id);
    if (!shouldRenderTagsRow) return null;

    return (
        <>
            {isNew && <CustomTag name={getIntlMessage("NEW")} />}
            {isPinned && <CustomTag name={getIntlMessageFromHash("1QLRYW")} icon={<PinIcon />} />}
            {shownTags.map(tag => (
                <Tag
                    tag={tag}
                    className={cl(tagsClassName, {
                        "vc-better-forums-tag-filtered": tagFilter.has(tag.id),
                    })}
                    key={tag.id}
                />
            ))}
            {moreTagsCount > 0 && <MoreTags tags={remainingTags} count={moreTagsCount} />}
        </>
    );
}
