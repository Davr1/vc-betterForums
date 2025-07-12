/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect } from "@webpack/common";
import { Guild, User } from "discord-types/general";

import { MissingGuildMemberStore, UserStore } from "../../stores";
import { FullUser } from "../../types";

export function useUsers(
    guildId: Guild["id"],
    userIds: User["id"][],
    limit: number = Number.MAX_SAFE_INTEGER
) {
    useEffect(
        () => MissingGuildMemberStore.requestMembersBulk(guildId, userIds),
        [guildId, userIds]
    );

    return UserStore.use(
        $ => userIds.values().map($.getUser).filter(Boolean).take(limit).toArray(),
        [userIds, limit]
    ) as FullUser[];
}
