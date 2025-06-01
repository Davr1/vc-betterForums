/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage, getIntlMessageFromHash } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { findByCodeLazy, findComponentByCodeLazy } from "@webpack";
import { React, Text, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { cl } from "..";
import { ForumPostMessagesStore, RelationshipStore } from "../stores";

const getMessageContent: (
    message: Message,
    content: React.ReactNode,
    isBlocked?: boolean,
    isIgnored?: boolean,
    className?: string,
    props?: { trailingIconClass?: string; leadingIconClass?: string; iconSize?: number }
) => Record<
    "contentPlaceholder" | "renderedContent" | "trailingIcon" | "leadingIcon",
    React.ReactNode
> = findByCodeLazy("#{intl::MESSAGE_PINNED}");

interface UsernameProps {
    message: Message | null;
    channel: Channel;
    renderColon?: boolean;
    hasUnreads?: boolean;
}
const Username = findComponentByCodeLazy<UsernameProps>("#{intl::FORUM_POST_AUTHOR_A11Y_LABEL}");

interface ForumPostContentProps {
    message: Message | null;
    channel: Channel;
    content: React.ReactNode;
    hasMediaAttachment: boolean;
    hasUnreads: boolean;
}

export const ForumPostContent = LazyComponent(() =>
    React.memo(function ForumPostContent({
        message,
        channel,
        content,
        hasMediaAttachment,
        hasUnreads,
    }: ForumPostContentProps) {
        const { isBlocked, isIgnored } = useStateFromStores([RelationshipStore], () => ({
            isBlocked: !!message && RelationshipStore.isBlockedForMessage(message),
            isIgnored: !!message && RelationshipStore.isIgnoredForMessage(message),
        }));

        const isLoading = useStateFromStores([ForumPostMessagesStore], () =>
            ForumPostMessagesStore.isLoading(channel.id)
        );

        let component: React.ReactNode | null = null;

        if (isBlocked || isIgnored)
            component = (
                <Text className={"blockedMessage"} variant="text-sm/medium" color="text-muted">
                    {getIntlMessage(
                        isBlocked
                            ? "FORUM_POST_BLOCKED_FIRST_MESSAGE"
                            : "FORUM_POST_IGNORED_FIRST_MESSAGE"
                    )}
                </Text>
            );
        else {
            const className = cl("messageContent", "inlineFormat", "__invalid_smallFontSize");
            const props = {
                leadingIconClass: "messageContentLeadingIcon",
                trailingIconClass: "messageContentTrailingIcon",
                iconSize: 20,
            };

            const { contentPlaceholder, renderedContent } = !message
                ? { contentPlaceholder: null, renderedContent: null }
                : getMessageContent(message, content, isBlocked, isIgnored, className, props);

            component = renderedContent ? (
                <Text
                    variant="text-sm/semibold"
                    color={hasUnreads ? "header-secondary" : "text-muted"}
                >
                    {renderedContent}
                </Text>
            ) : hasMediaAttachment ? null : (
                <Text
                    tag="span"
                    variant="text-sm/medium"
                    color={hasUnreads ? "header-secondary" : "text-muted"}
                    className={"messageContent"}
                >
                    {!message
                        ? isLoading
                            ? null
                            : getIntlMessageFromHash("mE3KJC")
                        : contentPlaceholder}
                </Text>
            );
        }

        return (
            <>
                {!isBlocked && (
                    <Username
                        channel={channel}
                        message={message}
                        renderColon={!!component}
                        hasUnreads={hasUnreads}
                    />
                )}
                <div className={"messageFocusBlock"}>{component}</div>
            </>
        );
    })
);
