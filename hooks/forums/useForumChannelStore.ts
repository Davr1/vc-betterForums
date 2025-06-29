/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ForumChannelStore } from "../../stores";

let store: () => ForumChannelStore | null = () => null;

export function setForumChannelStore(storeGetter: () => ForumChannelStore) {
    store = storeGetter;
}

export function useForumChannelStore(): ForumChannelStore | null {
    return store();
}
