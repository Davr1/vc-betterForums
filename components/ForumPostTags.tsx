/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { ChannelStore, useCallback, useStateFromStores } from "@webpack/common";

import { cl } from "..";
import {
    CustomTag,
    CustomTagType,
    DiscordTag,
    ForumChannel,
    Tag as TagType,
    ThreadChannel,
    useForumChannelState,
    useForumPostState,
} from "../utils";
import { PinIcon } from "./icons";
import { MoreTags, Tag } from "./Tags";

export function useTags(channel: ThreadChannel): TagType[] {
    const { isNew } = useForumPostState(channel);

    return useStateFromStores(
        [ChannelStore],
        () => {
            const isPinned = channel.hasFlag(2);
            const isArchived = channel.isArchivedThread();
            const isLocked = channel.threadMetadata?.locked === true;

            const customTags: CustomTag[] = (
                [
                    isNew && { id: "new", name: getIntlMessage("NEW") },
                    isPinned && {
                        id: "pinned",
                        name: getIntlMessage("PINNED_POST"),
                        icon: <PinIcon />,
                    },
                    isArchived && {
                        id: "archived",
                        name: getIntlMessage("THREAD_BROWSER_ARCHIVED"),
                    },
                    isLocked && { id: "locked", name: "Locked" },
                ] as Array<CustomTag | false>
            )
                .filter(tag => !!tag)
                .map(tag => ({ ...tag, id: tag.id as CustomTagType, custom: true }));

            const forumChannel = ChannelStore.getChannel(channel.parent_id) as ForumChannel | null;

            const availableTags = (forumChannel?.availableTags ?? []).reduce((acc, tag) => {
                acc[tag.id] = tag;
                return acc;
            }, {} as Record<DiscordTag["id"], TagType>);

            const appliedTags = (channel.appliedTags ?? []).map(tag => availableTags[tag]);

            return [...customTags, ...appliedTags];
        },
        [channel, isNew]
    );
}

interface ForumPostTagsProps {
    channel: ThreadChannel;
    tagsClassName?: string;
    className?: string;
}

const visibleTagsLimit = 3;

export function ForumPostTags({ channel, tagsClassName }: ForumPostTagsProps) {
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

    if (tags.length === 0) return null;

    return [
        tags.slice(0, visibleTagsLimit).map(renderTag),
        tags.length > visibleTagsLimit && (
            <MoreTags tags={tags.slice(visibleTagsLimit)} renderTag={renderTag} />
        ),
    ];
}
