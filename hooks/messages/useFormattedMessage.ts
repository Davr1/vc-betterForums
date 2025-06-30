/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { findByCodeLazy } from "@webpack";
import { lodash, useMemo } from "@webpack/common";
import { ReactNode } from "react";

import { ChannelStore, ForumPostMessagesStore, RelationshipStore } from "../../stores";
import { FullMessage, MessageFormatterOptions } from "../../types";
import { useMessage, useStores } from "../index";

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
    channelId,
    className,
    iconSize,
    iconClassName,
}: MessageFormatterOptions): Record<"content" | "leadingIcon" | "trailingIcon", ReactNode> & {
    systemMessage: boolean;
} {
    const isLoading = useStores(
        [ForumPostMessagesStore, ChannelStore],
        (forumPostMessagesStore, channelStore) => {
            if (!channelId) return false;

            const channel = channelStore.getChannel(channelId);
            if (!channel?.isActiveThread()) return false;

            const { firstMessage, loaded } = forumPostMessagesStore.getMessage(channelId);
            if (firstMessage?.id !== message?.id) return false;

            return !loaded;
        },
        [channelId, message?.id]
    );

    const { isAuthorBlocked, isAuthorIgnored } = RelationshipStore.use(
        $ => ({
            isAuthorBlocked: !!message && $.isBlockedForMessage(message),
            isAuthorIgnored: !!message && $.isIgnoredForMessage(message),
        }),
        [message],
        lodash.isEqual
    );

    const { content, media } = useMessage({ message });

    const { contentPlaceholder, renderedContent, leadingIcon, trailingIcon } = useMemo(() => {
        if (!message) return {} as Record<keyof ReturnType<typeof getReplyPreview>, undefined>;

        return getReplyPreview(message, content, isAuthorBlocked, isAuthorIgnored, className, {
            iconSize,
            leadingIconClass: iconClassName,
            trailingIconClass: iconClassName,
        });
    }, [message, content, isAuthorBlocked, isAuthorIgnored, className, iconSize, iconClassName]);

    switch (true) {
        case isAuthorBlocked:
            return systemMessage(getIntlMessage("FORUM_POST_BLOCKED_FIRST_MESSAGE"));
        case isAuthorIgnored:
            return systemMessage(getIntlMessage("FORUM_POST_IGNORED_FIRST_MESSAGE"));
        case !!renderedContent:
            return { content: renderedContent, leadingIcon, trailingIcon, systemMessage: false };
        case media.length > 0:
            return systemMessage(getIntlMessage("REPLY_QUOTE_NO_TEXT_CONTENT"));
        case !message:
            return systemMessage(isLoading ? "..." : getIntlMessage("REPLY_QUOTE_MESSAGE_DELETED"));
        default:
            return systemMessage(contentPlaceholder);
    }

    function systemMessage(content: ReactNode) {
        return { content, systemMessage: true, leadingIcon, trailingIcon };
    }
}
