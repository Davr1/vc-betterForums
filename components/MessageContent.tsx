/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text } from "@webpack/common";
import { TextProps } from "@webpack/types";
import { Channel } from "discord-types/general";

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
    messageClassName = "vc-better-forums-message-content",
    visibleIcons,
    ...props
}) {
    const {
        content: messageContent,
        systemMessage,
        leadingIcon,
        trailingIcon,
    } = useFormattedMessage({
        message,
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
            className={cl(className, "vc-better-forums-latest-message-content-wrapper")}
            {...props}
        >
            {messageContent}
        </Text>
    );

    return visibleIcons ? [leadingIcon, text, trailingIcon] : text;
});
