/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { Text, useMemo } from "@webpack/common";

import { ForumSearchStore } from "../../stores";
import { _memo, parseInlineContent } from "../../utils";
import { getSearchHighlighter } from "../../utils/postProcessors";

interface TitleProps {
    channel: Channel;
    isMuted?: boolean;
    isUnread?: boolean;
}

export const Title = _memo<TitleProps>(function Title({ channel, isMuted, isUnread }) {
    const searchQuery = ForumSearchStore.use(
        $ => $.getSearchQuery(channel.parent_id) ?? "",
        [channel.parent_id]
    );

    const postProcessor = useMemo(() => getSearchHighlighter(searchQuery), [searchQuery]);

    const { content } = useMemo(
        () => parseInlineContent({ content: channel.name, embeds: [] }, { postProcessor }),
        [channel.name, postProcessor]
    );

    return (
        <Text
            lineClamp={2}
            color={isMuted ? "interactive-muted" : isUnread ? "header-primary" : "text-secondary"}
            className="vc-better-forums-thread-title"
        >
            {content}
        </Text>
    );
});
