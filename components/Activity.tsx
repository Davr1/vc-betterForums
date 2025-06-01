/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text, Timestamp, Tooltip } from "@webpack/common";
import { Channel } from "discord-types/general";

import { useFormatTimestamp, useForumChannelState } from "../utils";

interface ActivityProps {
    channel: Channel;
}
export function Activity({ channel }: ActivityProps) {
    const { sortOrder } = useForumChannelState(channel.parent_id);
    const children = useFormatTimestamp(channel, sortOrder);
    const createTimestamp = channel.threadMetadata?.createTimestamp ?? ""; // TODO: different timestamp based on sortOrder

    return (
        <Tooltip text={<Timestamp timestamp={new Date(createTimestamp)} />}>
            {props => (
                <Text
                    className={"__invalid_activityText"}
                    variant="text-sm/normal"
                    color="header-secondary"
                    {...props}
                >
                    {children}
                </Text>
            )}
        </Tooltip>
    );
}
