/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText, BaseTextProps } from "@components/BaseText";
import { Channel } from "@vencord/discord-types";

import { cl } from "..";
import { useFormattedMessage } from "../hooks";
import { FullMessage } from "../types";
import { _memo, textClampStyle } from "../utils";

interface MessageContentProps extends Omit<BaseTextProps, "children"> {
    channel: Channel;
    message: FullMessage | null;
    messageClassName?: string;
    visibleIcons?: boolean;
    lineClamp?: number;
}

export const MessageContent = _memo<MessageContentProps>(function MessageContent({
    channel,
    message,
    className,
    messageClassName,
    visibleIcons,
    lineClamp,
    style,
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
        <BaseText
            style={{
                color: "currentcolor",
                fontStyle: systemMessage ? "italic" : "normal",
                ...textClampStyle(lineClamp),
                ...style,
            }}
            size="sm"
            weight="normal"
            className={cl(className, "vc-better-forums-latest-message-content-wrapper")}
            {...props}
        >
            {content}
        </BaseText>
    );

    return visibleIcons ? [leadingIcon, text, trailingIcon] : text;
});
