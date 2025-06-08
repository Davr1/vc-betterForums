/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, UserStore, useStateFromStores } from "@webpack/common";
import { Guild, User } from "discord-types/general";

import { GuildMemberRequesterStore } from "../stores";

export function useUsers(guildId: Guild["id"], userIds: User["id"][], limit?: number) {
    const users = useStateFromStores(
        [UserStore],
        () => userIds.map(UserStore.getUser).filter(Boolean).slice(0, limit),
        [userIds, limit]
    );

    useEffect(() => {
        userIds.forEach(user => GuildMemberRequesterStore.requestMember(guildId, user));
    }, [userIds, guildId]);

    return users;
}
