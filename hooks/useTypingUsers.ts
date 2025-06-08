/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { UserStore, useStateFromStores } from "@webpack/common";
import { Channel, User } from "discord-types/general";

import { RelationshipStore, TypingStore } from "../stores";

export function useTypingUsers(
    channelId: Channel["id"],
    limit: number = Number.MAX_SAFE_INTEGER
): User["id"][] {
    return useStateFromStores(
        [UserStore, TypingStore, RelationshipStore],
        () => {
            const currentUserId = UserStore.getCurrentUser()?.id;
            const typingUsers = TypingStore.getTypingUsers(channelId);
            const users: User["id"][] = [];

            for (const userId in typingUsers) {
                if (users.length >= limit) break;
                const user = UserStore.getUser(userId);
                if (!user || user.id === currentUserId) continue;

                if (!RelationshipStore.isBlockedOrIgnored(user.id)) {
                    users.push(user.id);
                }
            }

            return users;
        },
        [channelId, limit]
    );
}
