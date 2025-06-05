/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex, Heading, Text } from "@webpack/common";
import { Message } from "discord-types/general";

import { ThreadChannel, useChannelName } from "../utils";
import { ForumPostTags } from "./ForumPostTags";
import { MessageContent } from "./MessageContent";
import { Timestamp } from "./Timestamp";
import { Username } from "./Username";

interface ForumPostBodyProps {
    channel: ThreadChannel;
    firstMessage: Message | null;
}

export function ForumPostBody({ channel, firstMessage }: ForumPostBodyProps) {
    const channelName = useChannelName(channel);

    return (
        <Flex className="vc-better-forums-thread-body" direction={Flex.Direction.VERTICAL}>
            <Flex className="vc-better-forums-thread-header" align={Flex.Align.CENTER} grow={0}>
                <Username channel={channel} message={firstMessage} renderColon={false} />
                <Timestamp channel={channel} />
            </Flex>
            <Heading
                variant="heading-lg/semibold"
                color="header-primary"
                className="vc-better-forums-thread-title-container"
            >
                <Text lineClamp={2}>{channelName}</Text>
                <ForumPostTags channel={channel} />
            </Heading>
            <MessageContent
                channel={channel}
                message={firstMessage}
                color="text-secondary"
                lineClamp={3}
            />
        </Flex>
    );
}
