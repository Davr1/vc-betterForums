/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text, useStateFromStores } from "@webpack/common";
import { TextProps } from "@webpack/types";
import { Channel, Message } from "discord-types/general";

import { useForumPostMetadata, useMessageContent } from "../hooks";
import { RelationshipStore } from "../stores";
import { _memo } from "../utils";

interface MessageContentProps extends Omit<TextProps, "children"> {
    channel: Channel;
    message: Message | null;
    messageClassName?: string;
    visibleIcons?: boolean;
}

export const MessageContent = _memo<MessageContentProps>(function MessageContent({
    channel,
    message,
    messageClassName = "vc-better-forums-message-content",
    visibleIcons,
    ...props
}) {
    const { content, firstMedia } = useForumPostMetadata({ firstMessage: message });

    const { isBlocked, isIgnored } = useStateFromStores(
        [RelationshipStore],
        () => ({
            isBlocked: !!message && RelationshipStore.isBlockedForMessage(message),
            isIgnored: !!message && RelationshipStore.isIgnoredForMessage(message),
        }),
        [message]
    );

    const {
        content: messageContent,
        systemMessage,
        leadingIcon,
        trailingIcon,
    } = useMessageContent({
        channel,
        message,
        content,
        hasMediaAttachment: !!firstMedia,
        isAuthorBlocked: isBlocked,
        isAuthorIgnored: isIgnored,
        className: messageClassName,
        iconSize: 16,
        iconClassName: "vc-better-forums-message-icon",
    });

    const text = (
        <Text
            style={{
                fontStyle: systemMessage ? "italic" : "normal",
                ...props.style,
            }}
            color="currentColor"
            variant="text-sm/normal"
            {...props}
        >
            {messageContent}
        </Text>
    );

    return visibleIcons ? [leadingIcon, text, trailingIcon] : text;
});
