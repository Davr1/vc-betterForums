/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { Text, Timestamp as TimestampComponent, Tooltip } from "@webpack/common";

import { useFormatTimestamp, useForumChannelState } from "../hooks";
import { _memo } from "../utils";

interface TimestampProps {
    channel: Channel;
}

export const Timestamp = _memo<TimestampProps>(function Timestamp({ channel }) {
    const { sortOrder } = useForumChannelState(channel.parent_id);
    const children = useFormatTimestamp(channel, sortOrder);
    const createTimestamp = channel.threadMetadata?.createTimestamp ?? "";

    return (
        <Tooltip
            text={
                <TimestampComponent
                    timestamp={new Date(createTimestamp)}
                    className="vc-better-forums-timestamp"
                />
            }
        >
            {props => (
                <Text
                    variant="text-sm/normal"
                    color="text-secondary"
                    className="vc-better-forums-timestamp-text"
                    {...props}
                >
                    {children}
                </Text>
            )}
        </Tooltip>
    );
});
