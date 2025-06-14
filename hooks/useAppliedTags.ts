/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo, useStateFromStores } from "@webpack/common";

import { settings } from "../settings";
import { ChannelStore } from "../stores";
import { CustomTag, DiscordTag, ForumChannel, ThreadChannel } from "../types";
import { tagDefinitions } from "../utils";
import { useForumPostState } from "./";

export function useAppliedTags(channel: ThreadChannel): CustomTag[] {
    const { customTags: customTagOverrides } = settings.use(["customTags"]);
    const context = useForumPostState(channel);

    const availableTags = useStateFromStores(
        [ChannelStore],
        () => {
            const forumChannel = ChannelStore.getChannel(channel.parent_id) as ForumChannel | null;

            return (forumChannel?.availableTags ?? []).reduce((acc, tag) => {
                acc[tag.id] = tag;
                return acc;
            }, {} as Record<DiscordTag["id"], DiscordTag>);
        },
        [channel.parent_id]
    );

    const appliedTags = useStateFromStores(
        [ChannelStore],
        () =>
            (channel.appliedTags ?? [])
                .map(tagId => availableTags[tagId])
                .map<CustomTag>(tag => ({ custom: false, ...tag }))
                .filter(Boolean),
        [channel.appliedTags]
    );

    const customTags = useMemo(
        () =>
            tagDefinitions
                .filter(tag => customTagOverrides[tag.id])
                .filter(def => !def.condition || def.condition(context)),
        [channel, context, customTagOverrides]
    );

    return useMemo(() => [...customTags, ...appliedTags], [appliedTags, customTags]);
}
