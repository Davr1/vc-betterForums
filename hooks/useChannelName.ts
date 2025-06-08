/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { useMemo, useStateFromStores } from "@webpack/common";
import { Channel } from "discord-types/general";
import { ReactNode } from "react";

import { ForumSearchStore } from "../stores";

type Match = {
    type: "text" | "highlight";
    content: string | Match;
    originalMatch: RegExpExecArray;
};

type PostProcessor = (match: Match[], filters: Set<string>) => Match[];

const getTitlePostprocessor: (query: string) => PostProcessor = findByCodeLazy('type:"highlight"');
const textHightlightParser: (
    data: { content: string; embeds: [] },
    options: { postProcessor: PostProcessor }
) => {
    content: React.ReactNode;
    hasSpoilerEmbeds: boolean;
} = findByCodeLazy("hideSimpleEmbedContent:", "1!==");

export function useChannelName(channel: Channel): ReactNode {
    const hasSearchResults = useStateFromStores(
        [ForumSearchStore],
        () => ForumSearchStore.getHasSearchResults(channel.parent_id),
        [channel.parent_id]
    );

    const searchQuery = useStateFromStores(
        [ForumSearchStore],
        () => ForumSearchStore.getSearchQuery(channel.parent_id),
        [channel.parent_id]
    );

    const postProcessor = useMemo(
        () => getTitlePostprocessor(hasSearchResults && searchQuery ? searchQuery : ""),
        [hasSearchResults, searchQuery]
    );

    return useMemo(
        () =>
            textHightlightParser({ content: channel.name, embeds: [] }, { postProcessor }).content,
        [channel.name, postProcessor]
    );
}
