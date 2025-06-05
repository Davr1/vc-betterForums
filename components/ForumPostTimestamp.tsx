/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text, Timestamp, Tooltip } from "@webpack/common";
import { Channel } from "discord-types/general";

import { useFormatTimestamp, useForumChannelState } from "../utils";

interface ForumPostTimestampProps {
    channel: Channel;
}

export function ForumPostTimestamp({ channel }: ForumPostTimestampProps) {
    const { sortOrder } = useForumChannelState(channel.parent_id);
    const children = useFormatTimestamp(channel, sortOrder);
    const createTimestamp = channel.threadMetadata?.createTimestamp ?? "";

    return (
        <Tooltip
            text={
                <Timestamp
                    timestamp={new Date(createTimestamp)}
                    className="vc-better-forums-timestamp"
                />
            }
        >
            {props => (
                <Text variant="text-sm/normal" color="header-secondary" {...props}>
                    {children}
                </Text>
            )}
        </Tooltip>
    );
}
