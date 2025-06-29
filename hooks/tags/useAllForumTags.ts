/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChannelStore } from "../../stores";
import { CustomTag } from "../../types";

export function useAllForumTags(): Map<CustomTag["id"], CustomTag> {
    return ChannelStore.use($ => {
        const forumChannels = Object.values($.loadAllGuildAndPrivateChannelsFromDisk())
            .filter(channel => channel.isForumLikeChannel())
            .filter(channel => channel.availableTags.length > 0);

        const tags = forumChannels.flatMap(channel =>
            channel.availableTags.map(tag => ({ ...tag, channelId: channel.id }))
        );

        return new Map(tags.map(tag => [tag.id, tag]));
    });
}
