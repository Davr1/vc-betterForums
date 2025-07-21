/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, Guild } from "@vencord/discord-types";
import { GuildStore, lodash, SnowflakeUtils } from "@webpack/common";

import { JoinedThreadsStore, MissingGuildMemberStore, ReadStateStore } from "../../stores";
import { ForumPostState } from "../../types";
import { useStores } from "../misc/useStores";

function getJoinedAtTime(guild: Guild): number {
    return +guild.joinedAt || +new Date(guild.joinedAt) || Date.now();
}

export function useForumPostState(channel: Channel): ForumPostState {
    const { id, ownerId, parent_id, guild_id } = channel;
    const isArchived = channel.isArchivedThread();
    const isLocked = channel.threadMetadata?.locked === true;
    const isPinned = channel.hasFlag(2);

    return useStores(
        [GuildStore, ReadStateStore, JoinedThreadsStore, MissingGuildMemberStore],
        (guildStore, readStateStore, joinedThreadsStore, missingGuildMemberStore) => {
            const guild: Guild | null = guildStore.getGuild(guild_id);
            const joinedAt = guild ? getJoinedAtTime(guild) : Date.now();

            const isActive = !!guild && !isArchived;
            const hasUnreads = isActive && readStateStore.isForumPostUnread(id);
            const isMuted = joinedThreadsStore.isMuted(id);
            const hasJoined = joinedThreadsStore.hasJoined(id);
            const hasOpened = readStateStore.hasOpenedThread(id);
            const isAbandoned = !missingGuildMemberStore.isMember(guild_id, ownerId);

            const createdAfterJoin = SnowflakeUtils.extractTimestamp(id) > joinedAt;
            const isNewThread = readStateStore.isNewForumThread(id, parent_id, guild);
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
