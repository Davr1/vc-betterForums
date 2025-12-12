/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import { Channel } from "@vencord/discord-types";
import { useMemo } from "@webpack/common";

import { ForumSearchStore } from "../../stores";
import { _memo, parseInlineContent, textClampStyle } from "../../utils";
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

    const color = isMuted ? "interactive-muted" : isUnread ? "text-strong" : "text-subtle";

    return (
        <BaseText
            size="lg"
            weight="semibold"
            style={{
                color: `var(--${color})`,
                ...textClampStyle(2),
            }}
            className="vc-better-forums-thread-title"
        >
            {content}
        </BaseText>
    );
});
