/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { classNameFactory } from "@api/Styles";
import { proxyLazy } from "@utils/lazy";
import definePlugin from "@utils/types";
import { zustandCreate, zustandPersist } from "@webpack/common";

import { ForumPost } from "./components/ForumPost";
import { setForumChannelStore } from "./hooks/forums/useForumChannelStore";
import { settings } from "./settings";
import { ForumChannelStore, ForumChannelStoreState, MissingGuildMemberStore } from "./stores";
import { indexedDBStorageFactory } from "./utils";

export const cl = classNameFactory();

const STORAGE_KEY = "BetterForums";

export default definePlugin({
    name: "BetterForums",
    description: "Complete forum list view redesign with QoL features.",
    authors: [
        {
            name: "Davri",
            id: 457579346282938368n,
        },
    ],
    settings,
    patches: [
        {
            find: ".getHasSearchResults",
            replacement: {
                match: /\.memo\(/,
                replace: ".memo($self.ForumPost??",
            },
        },
        {
            find: "this.toggleTagFilter",
            replacement: {
                match: /let (\i)=\(0,\i\.\i\)/,
                replace: "let $1=$self.createStore",
            },
            predicate: () => settings.store.keepState,
        },
    ],
    start() {
        // Initialize store as soon as Flux is available
        MissingGuildMemberStore.reset();
    },
    ForumPost,
    createStore(storeCreator: (_set: unknown, _get: unknown) => ForumChannelStore) {
        const useStore = proxyLazy<() => ForumChannelStore>(() =>
            zustandCreate(
                zustandPersist(storeCreator, {
                    name: `${STORAGE_KEY}-state`,
                    storage: indexedDBStorageFactory<ForumChannelStoreState>(),
                    partialize: ({ channelStates }: ForumChannelStore) => ({ channelStates }),
                })
            )
        );

        setForumChannelStore(useStore);

        return useStore;
    },
});
