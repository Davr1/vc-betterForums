/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect } from "@webpack/common";
import { Guild, User } from "discord-types/general";

import { MissingGuildMemberStore, UserStore } from "../../stores";

export function useUsers(guildId: Guild["id"], userIds: User["id"][], limit?: number) {
    const users = UserStore.use(
        $ => userIds.map($.getUser).filter(Boolean).slice(0, limit),
        [userIds, limit]
    );

    useEffect(
        () => MissingGuildMemberStore.requestMembersBulk(guildId, userIds),
        [guildId, userIds]
    );

    return users;
}
