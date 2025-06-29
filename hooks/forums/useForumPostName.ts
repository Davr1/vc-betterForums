/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { useMemo } from "@webpack/common";
import { Channel } from "discord-types/general";
import { ReactNode } from "react";

import { ForumSearchStore } from "../../stores";
import { TitlePostProcessor } from "../../types";

const getTitlePostprocessor: (query: string) => TitlePostProcessor =
    findByCodeLazy('type:"highlight"');
const textHightlightParser: (
    data: { content: string; embeds: [] },
    options: { postProcessor: TitlePostProcessor }
) => {
    content: React.ReactNode;
    hasSpoilerEmbeds: boolean;
} = findByCodeLazy("hideSimpleEmbedContent:", "1!==");

export function useForumPostName(channel: Channel): ReactNode {
    const hasSearchResults = ForumSearchStore.use(
        $ => $.getHasSearchResults(channel.parent_id),
        [channel.parent_id]
    );

    const searchQuery = ForumSearchStore.use(
        $ => $.getSearchQuery(channel.parent_id),
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
