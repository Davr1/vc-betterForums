/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { Text } from "@webpack/common";
import { Channel } from "discord-types/general";

import { cl } from "..";
import { useMessageCount } from "../utils";

interface MessageProps {
    channel: Channel;
    iconSize: number;
    showReadState?: boolean;
}

export function Message({ channel, iconSize, showReadState = false }: MessageProps) {
    const { messageCountText, unreadCount } = useMessageCount(channel);
    return (
        <div
            className={cl("messageCountBox", {
                hasRead: showReadState && !unreadCount,
            })}
        >
            <span className={"messageCountIcon"}>
                <span
                    data-size="custom"
                    color="currentColor"
                    data-width={iconSize}
                    data-height={iconSize}
                >
                    ICON
                </span>
            </span>
            <div className={"messageCountText"}>{messageCountText}</div>
            {unreadCount !== null && (
                <Text className={"newMessageCount"} variant="text-sm/semibold" color="text-brand">
                    {"(" +
                        getIntlMessage("CHANNEL_NEW_POSTS_LABEL", {
                            count: unreadCount,
                        }) +
                        ")"}
                </Text>
            )}
        </div>
    );
}
