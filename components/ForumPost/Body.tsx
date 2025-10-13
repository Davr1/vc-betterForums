/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Heading } from "@components/Heading";
import { Flex, useCallback } from "@webpack/common";

import { useForumPostState } from "../../hooks";
import { MessagePreviewLineCount, settings } from "../../settings";
import { UserStore } from "../../stores";
import { FullMessage, ThreadChannel } from "../../types";
import { _memo, textClampStyle, ThreadActions } from "../../utils";
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

    const owner = UserStore.use(
        $ => (channel?.ownerId ? $.getUser(channel.ownerId) : null),
        [channel?.ownerId]
    );

    const followAction = useCallback(
        () => (hasJoined ? ThreadActions.leaveThread(channel) : ThreadActions.joinThread(channel)),
        [hasJoined, channel]
    );

    return (
        <Flex className="vc-better-forums-thread-body" direction={Flex.Direction.VERTICAL}>
            <Flex className="vc-better-forums-thread-header" align={Flex.Align.CENTER} grow={0}>
                <Username channel={channel} user={owner ?? message?.author ?? null} />
                <Timestamp channel={channel} />
                {showFollowButton && <FollowButton hasJoined={hasJoined} onClick={followAction} />}
            </Flex>
            <Heading className="vc-better-forums-thread-title-container">
                <ForumPost.Title channel={channel} isMuted={isMuted} isUnread={hasUnreads} />
                <ForumPost.Tags channel={channel} />
            </Heading>
            <MessageContent
                channel={channel}
                message={message}
                style={{
                    color: "var(--text-secondary)",
                    ...textClampStyle(
                        messagePreviewLineCount === MessagePreviewLineCount.ALL
                            ? null
                            : messagePreviewLineCount
                    ),
                }}
            />
        </Flex>
    );
});
