/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";

import { settings } from "../../settings";
import { ChannelStore } from "../../stores";
import { CustomTag, DiscordTag, ForumChannel, ThreadChannel } from "../../types";
import { tagDefinitions } from "../../utils";
import { useForumPostState } from "../index";

export function useAppliedTags(channel: ThreadChannel): CustomTag[] {
    const { tagOverrides } = settings.use(["tagOverrides"]);
    const context = useForumPostState(channel);

    const availableTags = ChannelStore.use(
        $ => {
            const forumChannel = $.getChannel(channel.parent_id) as ForumChannel | null;

            return (forumChannel?.availableTags ?? []).reduce((acc, tag) => {
                acc[tag.id] = tag;
                return acc;
            }, {} as Record<DiscordTag["id"], DiscordTag>);
        },
        [channel.parent_id]
    );

    const appliedTags = useMemo(() => {
        return (channel.appliedTags ?? [])
            .map(tagId => availableTags[tagId])
            .map<CustomTag>(tag => ({ custom: false, channelId: channel.id, ...tag }))
            .filter(Boolean);
    }, [channel.appliedTags, availableTags, channel.id]);

    const customTags = useMemo(
        () => tagDefinitions.filter(def => !def.condition || def.condition(context)),
        [channel, context]
    );

    return useMemo(() => {
        return [...customTags, ...appliedTags]
            .map(tag => ({ ...tag, ...tagOverrides[tag.id] }))
            .filter(tag => !tag.disabled);
    }, [appliedTags, customTags, tagOverrides]);
}
