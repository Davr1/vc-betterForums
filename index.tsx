/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { classNameFactory } from "@api/Styles";
import definePlugin from "@utils/types";

import { ForumPost } from "./components/ForumPost";
import { ForumChannelStore } from "./stores";
import { setForumChannelStore } from "./utils";

export const cl = classNameFactory();

export default definePlugin({
    name: "BetterForums",
    description: "",
    authors: [],
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
                match: /(\i)=(\i)\(\)/,
                replace: "$&;$self.ForumChannelStore=$2",
            },
        },
        {
            find: "findUserIdSortedPosition",
            replacement: {
                match: /getSubscribedThreadIds\(\),\i=!1/,
                replace: "$&;return false;",
            },
        },
    ],
    ForumPost,
    set ForumChannelStore(value: () => ForumChannelStore) {
        setForumChannelStore(value());
    },
});
