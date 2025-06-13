/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChannelStore, useMemo, useStateFromStores } from "@webpack/common";

import { settings } from "../settings";
import {
    CustomTag,
    CustomTagDefinition,
    DiscordTag,
    ForumChannel,
    Tag as TagType,
    ThreadChannel,
} from "../types";
import { tagDefinitions } from "../utils";
import { useForumPostState } from "./";

export function useTags(channel: ThreadChannel): TagType[] {
    const { customTags: customTagOverrides } = settings.use(["customTags"]);
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
        () => (channel.appliedTags ?? []).map(tagId => availableTags[tagId]).filter(Boolean),
        [channel.appliedTags]
    );

    const customTags: CustomTag[] = useMemo(
        () =>
            (tagDefinitions as CustomTagDefinition[])
                .filter(tag => customTagOverrides[tag.id])
                .filter(def => def.condition(context))
                .map(({ id, name, icon, color }) => ({
                    id,
                    name: typeof name === "function" ? name() : name,
                    icon: icon?.(),
                    custom: true,
                    color,
                })),
        [channel, context, customTagOverrides]
    );

    return useMemo(() => [...customTags, ...appliedTags], [appliedTags, customTags]);
}
