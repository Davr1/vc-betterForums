/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { findByCodeLazy } from "@webpack";
import { useMemo, useStateFromStores } from "@webpack/common";
import { ReactNode } from "react";

import { ForumPostMessagesStore, RelationshipStore } from "../stores";
import { FullMessage, MessageFormattingOptions } from "../types";
import { useForumPostMetadata } from "./";

const getReplyPreview: (
    message: FullMessage,
    content: ReactNode,
    isBlocked: boolean | undefined,
    isIgnored: boolean | undefined,
    className?: string,
    props?: { trailingIconClass?: string; leadingIconClass?: string; iconSize?: number }
) => Record<"contentPlaceholder" | "renderedContent" | "trailingIcon" | "leadingIcon", ReactNode> =
    findByCodeLazy("#{intl::MESSAGE_PINNED}");

export function useMessageContent({
    message,
    className,
    iconSize,
    iconClassName,
}: MessageFormattingOptions): Record<"content" | "leadingIcon" | "trailingIcon", ReactNode> & {
    systemMessage: boolean;
} {
    const isLoading = useStateFromStores(
        [ForumPostMessagesStore],
        () => !!message?.channel_id && ForumPostMessagesStore.isLoading(message.channel_id),
        [message?.channel_id]
    );

    const isAuthorBlocked = useStateFromStores(
        [RelationshipStore],
        () => !!message && RelationshipStore.isBlockedForMessage(message),
        [message]
    );

    const isAuthorIgnored = useStateFromStores(
        [RelationshipStore],
        () => !!message && RelationshipStore.isIgnoredForMessage(message),
        [message]
    );

    const { content, firstMedia } = useForumPostMetadata({ firstMessage: message });

    const { contentPlaceholder, renderedContent, leadingIcon, trailingIcon } = useMemo(() => {
        return !message
            ? ({} as Record<keyof ReturnType<typeof getReplyPreview>, undefined>)
            : getReplyPreview(message, content, isAuthorBlocked, isAuthorIgnored, className, {
                  iconSize,
                  leadingIconClass: iconClassName,
                  trailingIconClass: iconClassName,
              });
    }, [message, content, isAuthorBlocked, isAuthorIgnored, className]);

    const systemMessage = { systemMessage: true, leadingIcon, trailingIcon } as const;

    if (isAuthorBlocked)
        return { content: getIntlMessage("FORUM_POST_BLOCKED_FIRST_MESSAGE"), ...systemMessage };

    if (isAuthorIgnored)
        return { content: getIntlMessage("FORUM_POST_IGNORED_FIRST_MESSAGE"), ...systemMessage };

    if (renderedContent)
        return { content: renderedContent, leadingIcon, trailingIcon, systemMessage: false };

    if (!!firstMedia)
        return { content: getIntlMessage("REPLY_QUOTE_NO_TEXT_CONTENT"), ...systemMessage };

    if (!message)
        return {
            content: isLoading ? "..." : getIntlMessage("REPLY_QUOTE_MESSAGE_DELETED"),
            ...systemMessage,
        };

    return { content: contentPlaceholder, ...systemMessage };
}
