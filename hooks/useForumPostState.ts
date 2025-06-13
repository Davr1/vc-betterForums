/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildStore, SnowflakeUtils, useStateFromStores } from "@webpack/common";
import { Channel, Guild } from "discord-types/general";

import {
    GuildMemberStore,
    JoinedThreadsStore,
    MissingGuildMemberStore,
    ReadStateStore,
} from "../stores";
import { ForumPostState } from "../types";

function getJoinedAtTime(guild: Guild): number {
    return +guild.joinedAt || +new Date(guild.joinedAt) || Date.now();
}

export function useForumPostState(channel: Channel): ForumPostState {
    return useStateFromStores(
        [GuildStore, ReadStateStore, JoinedThreadsStore, GuildMemberStore, MissingGuildMemberStore],
        () => {
            const guild: Guild | null = GuildStore.getGuild(channel.getGuildId());
            const joinedAt = guild ? getJoinedAtTime(guild) : Date.now();

            const isActive = !!guild && !channel.isArchivedThread();
            const hasUnreads = isActive && ReadStateStore.isForumPostUnread(channel.id);
            const isMuted = JoinedThreadsStore.isMuted(channel.id);
            const hasJoined = JoinedThreadsStore.hasJoined(channel.id);
            const hasOpened = ReadStateStore.hasOpenedThread(channel.id);
            const isLocked = channel.threadMetadata?.locked === true;
            const isPinned = channel.hasFlag(2);
            const isAbandoned = !MissingGuildMemberStore.isMember(guild.id, channel.ownerId);

            const isNew =
                isActive &&
                !hasOpened &&
                SnowflakeUtils.extractTimestamp(channel.id) > joinedAt &&
                (ReadStateStore.isNewForumThread(channel.id, channel.parent_id, guild) ||
                    hasUnreads);

            return {
                isActive,
                isNew,
                hasUnreads,
                isMuted,
                hasJoined,
                hasOpened,
                isLocked,
                isPinned,
                isAbandoned,
            };
        },
        [channel]
    );
}
