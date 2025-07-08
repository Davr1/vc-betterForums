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
    usePreview,
    useRecentMessage,
    useTypingUsers,
} from "../../../hooks";
import { settings } from "../../../settings";
import { ThreadChannel } from "../../../types";
import { _memo, MessageUtils } from "../../../utils";
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
    const { highlightNewMessages } = settings.use(["highlightNewMessages"]);

    const mostRecentMessage = useRecentMessage(channel);
    const hasRecentMessage = !!mostRecentMessage;
    const messageId = mostRecentMessage?.id ?? channel.lastMessageId;

    const typingUsers = useTypingUsers(channel.id);
    const hasTypingUsers = typingUsers.length > 0;

    const forumState = useForumPostState(channel);
    const { messageCount, messageCountText, unreadCount, unreadCountText } =
        useMessageCount(channel);

    const { isReplyPreview, isTypingIndicator, isEmpty } = usePreview(
        forumState,
        hasRecentMessage,
        hasTypingUsers
    );

    const clickHandler = useCallback(() => {
        // wait until router navigation
        setImmediate(() =>
            MessageUtils.jumpToMessage({ channelId: channel.id, messageId, flash: true })
        );
    }, [channel.id, messageId]);

    if (isEmpty && messageCount === 0) return <FooterSection.Spacer />;

    const isActive = highlightNewMessages && !!unreadCount && !forumState.isMuted;

    return (
        <FooterSection
            className={cl("vc-better-forums-latest-message", {
                "vc-better-forums-empty-section": isEmpty,
            })}
            icon={<Icons.Chat />}
            text={messageCountText}
            onClick={messageId ? clickHandler : undefined}
            active={isActive}
        >
            {isTypingIndicator ? (
                <Typing channel={channel} users={typingUsers} />
            ) : isReplyPreview ? (
                <div className="vc-better-forums-latest-message-content">
                    <Username
                        channel={channel}
                        user={mostRecentMessage!.author}
                        renderColon
                        renderBadge
                    />
                    <MessageContent
                        channel={channel}
                        message={mostRecentMessage!}
                        variant={isActive ? "text-sm/semibold" : "text-sm/normal"}
                        lineClamp={1}
                        visibleIcons
                    />
                </div>
            ) : (
                !!unreadCount && "•"
            )}
            {!!unreadCount && (
                <Text variant="text-sm/semibold" color="text-brand">
                    {getIntlMessage("CHANNEL_NEW_POSTS_LABEL", {
                        count: unreadCountText,
                    })}
                </Text>
            )}
        </FooterSection>
    );
});
