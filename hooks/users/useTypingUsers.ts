/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { UserStore } from "@webpack/common";
import { Channel, User } from "discord-types/general";

import { RelationshipStore, TypingStore } from "../../stores";
import { useStores } from "../misc/useStores";

export function useTypingUsers(
    channelId: Channel["id"],
    limit: number = Number.MAX_SAFE_INTEGER
): User["id"][] {
    return useStores(
        [UserStore, TypingStore, RelationshipStore],
        (userStore, typingStore, relationshipStore) => {
            const currentUserId = userStore.getCurrentUser()?.id;
            const typingUsers = typingStore.getTypingUsers(channelId);
            const users: User["id"][] = [];

            for (const userId in typingUsers) {
                if (users.length >= limit) break;
                const user = UserStore.getUser(userId);
                if (!user || user.id === currentUserId) continue;

                if (!relationshipStore.isBlockedOrIgnored(user.id)) {
                    users.push(user.id);
                }
            }

            return users;
        },
        [channelId, limit]
    );
}
