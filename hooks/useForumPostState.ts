/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildStore, useStateFromStores } from "@webpack/common";
import { Channel, Guild } from "discord-types/general";

import { ReadStateStore } from "../stores";
import { ForumPostState } from "../types";

export function useForumPostState(channel: Channel): ForumPostState {
    return useStateFromStores(
        [GuildStore, ReadStateStore],
        () => {
            const guild: Guild | null = GuildStore.getGuild(channel.getGuildId());
            const isActive = !!guild && !channel.isArchivedThread();
            const isNew =
                isActive && ReadStateStore.isNewForumThread(channel.id, channel.parent_id, guild);
            const hasUnreads = isActive && ReadStateStore.isForumPostUnread(channel.id);

            return { isActive, isNew, hasUnreads };
        },
        [channel]
    );
}
