/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { ChannelStore, useMemo, useStateFromStores } from "@webpack/common";

import { Icons } from "../components/icons";
import { useForumPostState } from "../hooks";
import {
    CustomTag,
    CustomTagDefinition,
    DiscordTag,
    ForumChannel,
    Tag as TagType,
    ThreadChannel,
} from "../types";

const tagDefinitions: CustomTagDefinition[] = [
    {
        id: "new",
        name: () => getIntlMessage("NEW"),
        condition: (_, { isNew }) => isNew,
    },
    {
        id: "pinned",
        name: () => getIntlMessage("PINNED_POST"),
        icon: () => <Icons.PinIcon />,
        condition: channel => channel.hasFlag(2),
    },
    {
        id: "archived",
        name: () => getIntlMessage("THREAD_BROWSER_ARCHIVED"),
        icon: () => <Icons.ArchiveIcon />,
        condition: channel => channel.isArchivedThread(),
        color: "orange",
    },
    {
        id: "locked",
        name: "Locked",
        icon: () => <Icons.LockIcon />,
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
