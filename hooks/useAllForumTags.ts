/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useStateFromStores } from "@webpack/common";

import { ChannelStore } from "../stores";
import { CustomTag, ForumChannel } from "../types";

export function useAllForumTags(): Map<CustomTag["id"], CustomTag> {
    return useStateFromStores([ChannelStore], () => {
        const forumChannels = Object.values(
            ChannelStore.loadAllGuildAndPrivateChannelsFromDisk()
        ).filter(
            channel => channel.isForumLikeChannel() && channel.availableTags.length > 0
        ) as unknown[] as ForumChannel[];

        const tags = forumChannels.flatMap(channel =>
            channel.availableTags.map(tag => ({ ...tag, channelId: channel.id }))
        );

        return new Map(tags.map(tag => [tag.id, tag]));
    });
}
