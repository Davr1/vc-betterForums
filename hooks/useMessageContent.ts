/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { findByCodeLazy } from "@webpack";
import { useMemo, useStateFromStores } from "@webpack/common";
import { Message } from "discord-types/general";
import { ReactNode } from "react";

import { ForumPostMessagesStore } from "../stores";
import { MessageFormattingOptions } from "../types";

const getReplyPreview: (
    message: Message,
    content: ReactNode,
    isBlocked: boolean | undefined,
    isIgnored: boolean | undefined,
    className?: string,
    props?: { trailingIconClass?: string; leadingIconClass?: string; iconSize?: number }
) => Record<"contentPlaceholder" | "renderedContent" | "trailingIcon" | "leadingIcon", ReactNode> =
    findByCodeLazy("#{intl::MESSAGE_PINNED}");

export function useMessageContent({
    message,
    channel,
    content,
    hasMediaAttachment,
    isAuthorBlocked,
    isAuthorIgnored,
    className,
    iconSize,
    iconClassName,
}: MessageFormattingOptions): Record<"content" | "leadingIcon" | "trailingIcon", ReactNode> & {
    systemMessage: boolean;
} {
    const isLoading = useStateFromStores(
        [ForumPostMessagesStore],
        () => ForumPostMessagesStore.isLoading(channel.id),
        [channel.id]
    );

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

    if (hasMediaAttachment)
        return { content: getIntlMessage("REPLY_QUOTE_NO_TEXT_CONTENT"), ...systemMessage };

    if (!message)
        return {
            content: isLoading ? "..." : getIntlMessage("REPLY_QUOTE_MESSAGE_DELETED"),
            ...systemMessage,
        };

    return { content: contentPlaceholder, ...systemMessage };
}
