/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex, Heading, Text, useCallback, UserStore, useStateFromStores } from "@webpack/common";

import { useChannelName, useForumPostState } from "../../hooks";
import { settings } from "../../settings";
import { FullMessage, ThreadChannel } from "../../types";
import { _memo, threadUtils } from "../../utils";
import { MessageContent } from "../MessageContent";
import { Timestamp } from "../Timestamp";
import { Username } from "../Username";
import { ForumPost } from "./";
import { FollowButton } from "./FollowButton";

interface BodyProps {
    channel: ThreadChannel;
    message: FullMessage | null;
}

export const Body = _memo<BodyProps>(function Body({ channel, message }) {
    const { hasUnreads, isMuted, hasJoined } = useForumPostState(channel);
    const { messagePreviewLineCount, showFollowButton } = settings.use([
        "messagePreviewLineCount",
        "showFollowButton",
    ]);
    const channelName = useChannelName(channel);

    const owner = useStateFromStores(
        [UserStore],
        () => (channel?.ownerId ? UserStore.getUser(channel.ownerId) : null),
        [channel?.ownerId]
    );

    const followAction = useCallback(
        () => (hasJoined ? threadUtils.leaveThread(channel) : threadUtils.joinThread(channel)),
        [hasJoined, channel]
    );

    return (
        <Flex className="vc-better-forums-thread-body" direction={Flex.Direction.VERTICAL}>
            <Flex className="vc-better-forums-thread-header" align={Flex.Align.CENTER} grow={0}>
                <Username channel={channel} user={owner ?? message?.author ?? null} />
                <Timestamp channel={channel} />
                {showFollowButton && <FollowButton hasJoined={hasJoined} onClick={followAction} />}
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
                message={message}
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
});
