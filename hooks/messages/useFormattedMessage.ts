/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { findByCodeLazy } from "@webpack";
import { useMemo, useStateFromStores } from "@webpack/common";
import { ReactNode } from "react";

import { ChannelStore, ForumPostMessagesStore, RelationshipStore } from "../../stores";
import { FullMessage, MessageFormatterOptions } from "../../types";
import { useMessage } from "../index";

const getReplyPreview: (
    message: FullMessage | null,
    content: ReactNode,
    isBlocked: boolean | undefined,
    isIgnored: boolean | undefined,
    className?: string,
    props?: { trailingIconClass?: string; leadingIconClass?: string; iconSize?: number }
) => Record<"contentPlaceholder" | "renderedContent" | "trailingIcon" | "leadingIcon", ReactNode> =
    findByCodeLazy("#{intl::MESSAGE_PINNED}");

export function useFormattedMessage({
    message,
    className,
    iconSize,
    iconClassName,
}: MessageFormatterOptions): Record<"content" | "leadingIcon" | "trailingIcon", ReactNode> & {
    systemMessage: boolean;
} {
    const channelId = message?.getChannelId();

    const isLoading = useStateFromStores(
        [ForumPostMessagesStore, ChannelStore],
        () => {
            if (!channelId || !message?.id) return false;

            const channel = ChannelStore.getChannel(channelId);
            if (!channel?.isThread()) return false;

            const { firstMessage, loaded } = ForumPostMessagesStore.getMessage(channel.id);
            if (firstMessage?.id !== message.id) return false;

            return loaded;
        },
        [channelId, message?.id]
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

    const { content, media } = useMessage({ message });

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

    if (media.length === 0)
        return { content: getIntlMessage("REPLY_QUOTE_NO_TEXT_CONTENT"), ...systemMessage };

    if (!message)
        return {
            content: isLoading ? "..." : getIntlMessage("REPLY_QUOTE_MESSAGE_DELETED"),
            ...systemMessage,
        };

    return { content: contentPlaceholder, ...systemMessage };
}
