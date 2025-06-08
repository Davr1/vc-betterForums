/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildStore, useStateFromStores } from "@webpack/common";
import { Channel } from "discord-types/general";

import { GuildMemberStore, RelationshipStore } from "../stores";
import { FullGuildMember, FullUser } from "../types";

export function useMember(user: FullUser | null, channel: Channel) {
    const userId = user?.id;
    const guildId = channel?.guild_id;
    const member = useStateFromStores(
        [GuildMemberStore],
        () =>
            !guildId || !userId
                ? null
                : (GuildMemberStore.getMember(guildId, userId) as FullGuildMember),
        [guildId, userId]
    );

    const { guild, guildRoles } = useStateFromStores(
        [GuildStore],
        () => {
            const guild = GuildStore.getGuild(guildId);
            const guildRoles = guild ? GuildStore.getRoles(guild.id) : undefined;
            return { guild, guildRoles };
        },
        [guildId]
    );

    const friendNickname = useStateFromStores(
        [RelationshipStore],
        () => (userId && channel?.isPrivate() ? RelationshipStore.getNickname(userId) : null),
        [userId, channel]
    );

    const userName = user?.global_name || user?.globalName || user?.username || "???";

    if (!user?.id || !channel || !member) return { nick: userName };

    if (!guild?.id) return { nick: friendNickname ?? userName };

    const { nick, colorRoleId, iconRoleId, colorString, colorStrings } = member;

    return {
        nick: nick ?? userName,
        colorString,
        colorStrings,
        colorRoleName: colorRoleId && guild ? guildRoles?.[colorRoleId]?.name : undefined,
        colorRoleId,
        iconRoleId,
        guildMemberAvatar: member.avatar,
        guildMemberAvatarDecoration: member.avatarDecoration,
        primaryGuild: user?.primaryGuild,
        guildId: guild.id,
    };
}
