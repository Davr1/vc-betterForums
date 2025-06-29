/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { GuildRoleStore, GuildStore, useEffect, useStateFromStores } from "@webpack/common";
import { Channel } from "discord-types/general";

import { GuildMemberRequesterStore, GuildMemberStore, RelationshipStore } from "../../stores";
import { FullGuildMember, FullUser, Member } from "../../types";

export function useMember(user: FullUser | null, channel: Channel): Member {
    const userId = user?.id;
    const guildId = channel?.guild_id;

    useEffect(() => {
        userId && GuildMemberRequesterStore.requestMember(guildId, userId);
    }, [guildId, userId]);

    const member = useStateFromStores(
        [GuildMemberStore],
        () =>
            !guildId || !userId
                ? null
                : (GuildMemberStore.getMember(guildId, userId) as FullGuildMember | null),
        [guildId, userId]
    );

    const { guild, guildRoles } = useStateFromStores(
        [GuildStore, GuildRoleStore],
        () => {
            const guild = GuildStore.getGuild(guildId);
            const guildRoles = guild ? GuildRoleStore.getRoles(guild.id) : undefined;
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

    return {
        ...member,
        nick: member?.nick ?? userName,
        colorRoleName:
            member?.colorRoleId && guild ? guildRoles?.[member.colorRoleId]?.name : undefined,
        guildMemberAvatar: member.avatar,
        guildMemberAvatarDecoration: member.avatarDecoration,
        primaryGuild: user?.primaryGuild,
        guildId: guild.id,
    };
}
