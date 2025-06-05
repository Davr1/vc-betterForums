/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Text, useStateFromStores } from "@webpack/common";
import { TextProps } from "@webpack/types";
import { Channel, Message } from "discord-types/general";

import { Attachment } from "../components/ForumPostMedia";
import { RelationshipStore } from "../stores";
import { memoizedComponent, useMessageContent } from "../utils";

const useForumPostMetadata: (options: {
    firstMessage: Message | null;
    formatInline?: boolean;
    noStyleAndInteraction?: boolean;
}) => {
    hasSpoilerEmbeds: boolean;
    content: React.ReactNode | null;
    firstMedia: Attachment | null;
    firstMediaIsEmbed: boolean;
} = findByCodeLazy(/noStyleAndInteraction:\i=!0\}/);

interface MessageContentProps extends Omit<TextProps, "children"> {
    channel: Channel;
    message: Message | null;
    messageClassName?: string;
}

export const MessageContent = memoizedComponent<MessageContentProps>(function MessageContent({
    channel,
    message,
    messageClassName = "vc-better-forums-message-content",
    ...props
}) {
    const { content, firstMedia } = useForumPostMetadata({ firstMessage: message });

    const { isBlocked, isIgnored } = useStateFromStores([RelationshipStore], () => ({
        isBlocked: !!message && RelationshipStore.isBlockedForMessage(message),
        isIgnored: !!message && RelationshipStore.isIgnoredForMessage(message),
    }));

    const messageContent = useMessageContent({
        channel,
        message,
        content,
        hasMediaAttachment: true,
        isAuthorBlocked: isBlocked,
        isAuthorIgnored: isIgnored,
        className: messageClassName,
    });

    return (
        <Text
            style={{ fontStyle: isBlocked || isIgnored ? "italic" : "normal", ...props.style }}
            {...props}
        >
            {messageContent}
        </Text>
    );
});
