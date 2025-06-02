/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage, getIntlMessageFromHash } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { findByCodeLazy } from "@webpack";
import { React, Text, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { ForumPostMessagesStore } from "../stores";

const getMessageContent: (
    message: Message,
    content: React.ReactNode,
    isBlocked?: boolean,
    isIgnored?: boolean,
    className?: string,
    props?: { trailingIconClass?: string; leadingIconClass?: string; iconSize?: number }
) => Record<
    "contentPlaceholder" | "renderedContent" | "trailingIcon" | "leadingIcon",
    React.ReactNode | null
> = findByCodeLazy("#{intl::MESSAGE_PINNED}");

interface ForumPostContentProps {
    message: Message | null;
    channel: Channel;
    content: React.ReactNode;
    hasMediaAttachment: boolean;
    hasUnreads: boolean;
    isAuthorBlocked?: boolean;
    isAuthorIgnored?: boolean;
}

export const ForumPostContent = LazyComponent(() =>
    React.memo(function ForumPostContent({
        message,
        channel,
        content,
        hasMediaAttachment,
        hasUnreads,
        isAuthorBlocked,
        isAuthorIgnored,
    }: ForumPostContentProps) {
        const isLoading = useStateFromStores([ForumPostMessagesStore], () =>
            ForumPostMessagesStore.isLoading(channel.id)
        );

        let messageContent: React.ReactNode | null = null;

        if (isAuthorBlocked || isAuthorIgnored)
            messageContent = (
                <i>
                    {getIntlMessage(
                        isAuthorBlocked
                            ? "FORUM_POST_BLOCKED_FIRST_MESSAGE"
                            : "FORUM_POST_IGNORED_FIRST_MESSAGE"
                    )}
                </i>
            );
        else {
            const props = {
                leadingIconClass: "messageContentLeadingIcon",
                trailingIconClass: "messageContentTrailingIcon",
                iconSize: 20,
            };

            const { contentPlaceholder, renderedContent } = !message
                ? { contentPlaceholder: null, renderedContent: null }
                : getMessageContent(
                      message,
                      content,
                      isAuthorBlocked,
                      isAuthorIgnored,
                      "vc-better-forums-message-block-content",
                      props
                  );

            messageContent =
                renderedContent ||
                (hasMediaAttachment
                    ? null
                    : !message
                    ? isLoading
                        ? null
                        : getIntlMessageFromHash("mE3KJC")
                    : contentPlaceholder);
        }

        return (
            <div className="vc-better-forums-message-block">
                <Text variant="text-sm/normal" color="text-secondary" lineClamp={3}>
                    {messageContent}
                </Text>
            </div>
        );
    })
);
