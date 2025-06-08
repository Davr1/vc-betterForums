/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { ChannelStore, useCallback, useMemo, useStateFromStores } from "@webpack/common";
import { ReactNode } from "react";

import { cl } from "..";
import { settings } from "../settings";
import {
    CustomTag,
    DiscordTag,
    ForumChannel,
    ForumPostState,
    memoizedComponent,
    Tag as TagType,
    ThreadChannel,
    useForumChannelState,
    useForumPostState,
} from "../utils";
import { ArchiveIcon, LockIcon, PinIcon } from "./icons";
import { MoreTags, Tag } from "./Tags";

interface TagDefinition {
    id: CustomTag["id"];
    name: string | (() => string);
    icon?: () => ReactNode;
    condition: (channel: ThreadChannel, context: ForumPostState) => boolean;
    color?: CustomTag["color"];
}

const tagDefinitions: TagDefinition[] = [
    {
        id: "new",
        name: () => getIntlMessage("NEW"),
        condition: (_, { isNew }) => isNew,
    },
    {
        id: "pinned",
        name: () => getIntlMessage("PINNED_POST"),
        icon: () => <PinIcon />,
        condition: channel => channel.hasFlag(2),
    },
    {
        id: "archived",
        name: () => getIntlMessage("THREAD_BROWSER_ARCHIVED"),
        icon: () => <ArchiveIcon />,
        condition: channel => channel.isArchivedThread(),
        color: "orange",
    },
    {
        id: "locked",
        name: "Locked",
        icon: () => <LockIcon />,
        condition: channel => channel.threadMetadata?.locked === true,
        color: "orange",
    },
];

export function useTags(channel: ThreadChannel): TagType[] {
    const context = useForumPostState(channel);

    const availableTags = useStateFromStores(
        [ChannelStore],
        () => {
            const forumChannel = ChannelStore.getChannel(channel.parent_id) as ForumChannel | null;

            return (forumChannel?.availableTags ?? []).reduce((acc, tag) => {
                acc[tag.id] = tag;
                return acc;
            }, {} as Record<DiscordTag["id"], TagType>);
        },
        [channel.parent_id]
    );

    const appliedTags = useStateFromStores(
        [ChannelStore],
        () => (channel.appliedTags ?? []).map(tagId => availableTags[tagId]),
        [channel.appliedTags]
    );

    const customTags: CustomTag[] = useMemo(
        () =>
            tagDefinitions
                .filter(def => def.condition(channel, context))
                .map(({ id, name, icon, color }) => ({
                    id,
                    name: typeof name === "function" ? name() : name,
                    icon: icon?.(),
                    custom: true,
                    color,
                })),
        [channel, context]
    );

    return useMemo(() => [...customTags, ...appliedTags], [appliedTags, customTags]);
}

interface ForumPostTagsProps {
    channel: ThreadChannel;
    tagsClassName?: string;
    className?: string;
}

export const ForumPostTags = memoizedComponent<ForumPostTagsProps>(function ForumPostTags({
    channel,
    tagsClassName,
}) {
    const tags = useTags(channel);
    const { tagFilter } = useForumChannelState(channel.parent_id);
    const { maxTagCount } = settings.use(["maxTagCount"]);

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
        tags.slice(0, maxTagCount).map(renderTag),
        tags.length > maxTagCount && (
            <MoreTags tags={tags.slice(maxTagCount)} renderTag={renderTag} />
        ),
    ];
});
