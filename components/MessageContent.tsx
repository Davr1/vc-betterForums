/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, TextProps } from "@vencord/discord-types";
import { Text } from "@webpack/common";

import { cl } from "..";
import { useFormattedMessage } from "../hooks";
import { FullMessage } from "../types";
import { _memo } from "../utils";

interface MessageContentProps extends Omit<TextProps, "children"> {
    channel: Channel;
    message: FullMessage | null;
    messageClassName?: string;
    visibleIcons?: boolean;
}

export const MessageContent = _memo<MessageContentProps>(function MessageContent({
    channel,
    message,
    className,
    messageClassName,
    visibleIcons,
    lineClamp,
    ...props
}) {
    const { content, systemMessage, leadingIcon, trailingIcon } = useFormattedMessage({
        message,
        channelId: channel.id,
        className: cl(
            lineClamp === 1
                ? "vc-better-forums-message-content-inline"
                : "vc-better-forums-message-content",
            messageClassName
        ),
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
            className={cl(className, "vc-better-forums-latest-message-content-wrapper")}
            lineClamp={lineClamp}
            {...props}
        >
            {content}
        </Text>
    );

    return visibleIcons ? [leadingIcon, text, trailingIcon] : text;
});
