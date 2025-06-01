/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import definePlugin from "@utils/types";

import { ForumPost } from "./components/ForumPost";
import { setReactionButton } from "./components/Reaction";
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
                replace: "$&;$self.forumOptions=$2",
            },
        },
        {
            find: "this.userCanBurstReact",
            replacement: {
                match: /(\i)=(\i)\.memo/,
                replace: "$1=$self.ReactionButton=$2.memo",
            },
        },
    ],
    ForumPost,
    set forumOptions(value: () => ForumChannelStore) {
        setForumChannelStore(value());
    },
    set ReactionButton(value: React.FC) {
        setReactionButton(value);
    },
});
