/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { Text, useCallback } from "@webpack/common";

import { cl } from "../../..";
import {
    useForumPostState,
    useMessageCount,
    useRecentMessage,
    useTypingUsers,
} from "../../../hooks";
import { settings, ShowReplyPreview } from "../../../settings";
import { ThreadChannel } from "../../../types";
import { _memo, Kangaroo } from "../../../utils";
import { Icons } from "../../icons";
import { MessageContent } from "../../MessageContent";
import { Typing } from "../../Typing";
import { Username } from "../../Username";
import { FooterSection } from "./";

interface LatestMessageSectionProps {
    channel: ThreadChannel;
}

export const LatestMessageSection = _memo<LatestMessageSectionProps>(function LatestMessageSection({
    channel,
}) {
    const { showReplyPreview } = settings.use(["showReplyPreview"]);
    const { isMuted, hasJoined, hasUnreads, isNew } = useForumPostState(channel);
    const mostRecentMessage = useRecentMessage(channel);

    const { messageCount, messageCountText, unreadCount, unreadCountText } = useMessageCount(
        channel.id
    );

    const typingUsers = useTypingUsers(channel.id);

    const clickHandler = useCallback(() => {
        if (!mostRecentMessage?.id) return;

        setImmediate(() =>
            Kangaroo.jumpToMessage({
                channelId: channel.id,
                messageId: mostRecentMessage.id,
                flash: true,
            })
        );
    }, [channel.id, mostRecentMessage?.id]);

    if (messageCount === 0 && typingUsers.length === 0) return <FooterSection.Spacer />;

    const visibleReplyContent =
        !!mostRecentMessage &&
        !isMuted &&
        (showReplyPreview === ShowReplyPreview.ALWAYS ||
            (showReplyPreview === ShowReplyPreview.FOLLOWED_ONLY && hasJoined) ||
            (showReplyPreview === ShowReplyPreview.UNREADS_ONLY && (hasUnreads || isNew)));

    return (
        <FooterSection
            className={cl("vc-better-forums-latest-message", {
                "vc-better-forums-unread": !!unreadCount && !isMuted,
                "vc-better-forums-empty-section": !visibleReplyContent && typingUsers.length === 0,
            })}
            icon={<Icons.ChatIcon />}
            text={messageCountText}
            onClick={clickHandler}
        >
            {!visibleReplyContent && typingUsers.length === 0 ? null : typingUsers.length > 0 ? (
                <Typing channel={channel} users={typingUsers} />
            ) : (
                mostRecentMessage && (
                    <>
                        <div className="vc-better-forums-latest-message-content">
                            <Username
                                channel={channel}
                                user={mostRecentMessage.author}
                                renderColon
                                renderBadge
                            />
                            <MessageContent
                                channel={channel}
                                message={mostRecentMessage}
                                messageClassName="vc-better-forums-message-content-inline"
                                variant={unreadCount ? "text-sm/semibold" : "text-sm/normal"}
                                lineClamp={1}
                                visibleIcons
                            />
                        </div>
                        {unreadCount !== null && (
                            <Text variant="text-sm/semibold" color="text-brand">
                                {getIntlMessage("CHANNEL_NEW_POSTS_LABEL", {
                                    count: unreadCountText,
                                })}
                            </Text>
                        )}
                    </>
                )
            )}
        </FooterSection>
    );
});
