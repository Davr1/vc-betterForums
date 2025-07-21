/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { GuildRoleStore, GuildStore, useEffect } from "@webpack/common";

import { GuildMemberRequesterStore, GuildMemberStore, RelationshipStore } from "../../stores";
import { FullUser, Member } from "../../types";
import { useStores } from "../misc/useStores";

export function useMember(user: FullUser | null, channel: Channel): Member {
    const userId = user?.id;
    const guildId = channel?.guild_id;

    useEffect(() => {
        userId && GuildMemberRequesterStore.requestMember(guildId, userId);
    }, [guildId, userId]);

    const member = GuildMemberStore.use(
        $ => (!guildId || !userId ? null : $.getMember(guildId, userId)),
        [guildId, userId]
    );

    const { guild, guildRoles } = useStores(
        [GuildStore, GuildRoleStore],
        (guildStore, guildRoleStore) => {
            const guild = guildStore.getGuild(guildId);
            const guildRoles = guild ? guildRoleStore.getRoles(guild.id) : undefined;
            return { guild, guildRoles };
        },
        [guildId]
    );

    const friendNickname = RelationshipStore.use(
        $ => (userId && channel?.isPrivate() ? $.getNickname(userId) : null),
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
