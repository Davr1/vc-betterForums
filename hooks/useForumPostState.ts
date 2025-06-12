/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildStore, SnowflakeUtils, useStateFromStores } from "@webpack/common";
import { Channel, Guild } from "discord-types/general";

import { JoinedThreadsStore, ReadStateStore } from "../stores";
import { ForumPostState } from "../types";

function getJoinedAtTime(guild: Guild): number {
    return +guild.joinedAt || +new Date(guild.joinedAt) || Date.now();
}

export function useForumPostState(channel: Channel): ForumPostState {
    return useStateFromStores(
        [GuildStore, ReadStateStore, JoinedThreadsStore],
        () => {
            const guild: Guild | null = GuildStore.getGuild(channel.getGuildId());
            const joinedAt = guild ? getJoinedAtTime(guild) : Date.now();

            const hasOpened = ReadStateStore.hasOpenedThread(channel.id);
            const isActive = !!guild && !channel.isArchivedThread();
            const isMuted = JoinedThreadsStore.isMuted(channel.id);
            const hasJoined = JoinedThreadsStore.hasJoined(channel.id);
            const hasUnreads = isActive && ReadStateStore.isForumPostUnread(channel.id);

            const isNew =
                isActive &&
                !hasOpened &&
                SnowflakeUtils.extractTimestamp(channel.id) > joinedAt &&
                (ReadStateStore.isNewForumThread(channel.id, channel.parent_id, guild) ||
                    hasUnreads);

            return { isActive, isNew, hasUnreads, isMuted, hasJoined, hasOpened };
        },
        [channel]
    );
}
