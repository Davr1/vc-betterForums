/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildStore, lodash, SnowflakeUtils, useStateFromStores } from "@webpack/common";
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
    const { id, ownerId, parent_id, guild_id } = channel;
    const isArchived = channel.isArchivedThread();
    const isLocked = channel.threadMetadata?.locked === true;
    const isPinned = channel.hasFlag(2);

    return useStateFromStores(
        [GuildStore, ReadStateStore, JoinedThreadsStore, GuildMemberStore, MissingGuildMemberStore],
        () => {
            const guild: Guild | null = GuildStore.getGuild(guild_id);
            const joinedAt = guild ? getJoinedAtTime(guild) : Date.now();

            const isActive = !!guild && !isArchived;
            const hasUnreads = isActive && ReadStateStore.isForumPostUnread(id);
            const isMuted = JoinedThreadsStore.isMuted(id);
            const hasJoined = JoinedThreadsStore.hasJoined(id);
            const hasOpened = ReadStateStore.hasOpenedThread(id);
            const isAbandoned = !MissingGuildMemberStore.isMember(guild_id, ownerId);

            const createdAfterJoin = SnowflakeUtils.extractTimestamp(id) > joinedAt;
            const isNewThread = ReadStateStore.isNewForumThread(id, parent_id, guild);
            const isNew = isActive && !hasOpened && createdAfterJoin && (isNewThread || hasUnreads);

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
        [id, guild_id, isArchived, isLocked, isPinned, ownerId, parent_id],
        lodash.isEqual
    );
}
