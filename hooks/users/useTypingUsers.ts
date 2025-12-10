/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, User } from "@vencord/discord-types";
import { AuthenticationStore, lodash, UserStore } from "@webpack/common";

import { RelationshipStore, TypingStore } from "../../stores";
import { useStores } from "../misc/useStores";

export function useTypingUsers(
    channelId: Channel["id"],
    limit: number = Number.MAX_SAFE_INTEGER
): User["id"][] {
    return useStores(
        [UserStore, TypingStore, RelationshipStore, AuthenticationStore],
        (userStore, typingStore, relationshipStore, authStore) => {
            const currentUserId = authStore.getId();
            const typingUsers = Object.keys(typingStore.getTypingUsers(channelId)).values();

            return typingUsers
                .filter(id => id !== currentUserId)
                .filter(userStore.getUser)
                .filter(id => !relationshipStore.isBlockedOrIgnored(id))
                .take(limit)
                .toArray();
        },
        [channelId, limit],
        lodash.isEqual
    );
}
