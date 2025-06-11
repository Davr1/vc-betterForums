/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex, Heading, Text, useCallback } from "@webpack/common";
import { Message } from "discord-types/general";

import { useChannelName, useForumPostState } from "../../hooks";
import { settings } from "../../settings";
import { ThreadChannel } from "../../types";
import { threadUtils } from "../../utils";
import { MessageContent } from "../MessageContent";
import { Timestamp } from "../Timestamp";
import { Username } from "../Username";
import { ForumPost } from "./";
import { FollowButton } from "./FollowButton";

interface BodyProps {
    channel: ThreadChannel;
    firstMessage: Message | null;
}

export function Body({ channel, firstMessage }: BodyProps) {
    const { hasUnreads, isMuted, hasJoined } = useForumPostState(channel);
    const { messagePreviewLineCount } = settings.use(["messagePreviewLineCount"]);
    const channelName = useChannelName(channel);

    const followAction = useCallback(
        () => (hasJoined ? threadUtils.leaveThread(channel) : threadUtils.joinThread(channel)),
        [hasJoined, channel]
    );

    return (
        <Flex className="vc-better-forums-thread-body" direction={Flex.Direction.VERTICAL}>
            <Flex className="vc-better-forums-thread-header" align={Flex.Align.CENTER} grow={0}>
                <Username channel={channel} message={firstMessage} renderColon={false} />
                <Timestamp channel={channel} />
                <FollowButton hasJoined={hasJoined} onClick={followAction} />
            </Flex>
            <Heading
                variant="heading-lg/semibold"
                className="vc-better-forums-thread-title-container"
            >
                <Text
                    lineClamp={2}
                    color={
                        isMuted
                            ? "interactive-muted"
                            : hasUnreads
                            ? "header-primary"
                            : "text-secondary"
                    }
                    className="vc-better-forums-thread-title"
                >
                    {channelName}
                </Text>
                <ForumPost.Tags channel={channel} />
            </Heading>
            <MessageContent
                channel={channel}
                message={firstMessage}
                color="text-secondary"
                lineClamp={messagePreviewLineCount}
                messageClassName={
                    messagePreviewLineCount === 1
                        ? "vc-better-forums-message-content-inline"
                        : "vc-better-forums-message-content"
                }
            />
        </Flex>
    );
}
