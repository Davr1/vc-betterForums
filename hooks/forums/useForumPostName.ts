/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";
import { Channel } from "discord-types/general";
import { ReactNode } from "react";

import { ForumSearchStore } from "../../stores";
import { parseInlineContent } from "../../utils";
import { getSearchHighlighter } from "../../utils/postProcessors";

export function useForumPostName(channel: Channel): ReactNode {
    const searchQuery = ForumSearchStore.use(
        $ => $.getSearchQuery(channel.parent_id) ?? "",
        [channel.parent_id]
    );

    const postProcessor = useMemo(() => getSearchHighlighter(searchQuery), [searchQuery]);

    return useMemo(
        () => parseInlineContent({ content: channel.name, embeds: [] }, { postProcessor }).content,
        [channel.name, postProcessor]
    );
}
