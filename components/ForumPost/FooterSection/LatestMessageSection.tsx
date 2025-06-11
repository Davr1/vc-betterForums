/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { Text, useCallback, useStateFromStores } from "@webpack/common";

import { cl } from "../../..";
import { useForumPostState, useMessageCount, useTypingUsers } from "../../../hooks";
import { ThreadMessageStore } from "../../../stores";
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
    const { isMuted } = useForumPostState(channel);
    const mostRecentMessage = useStateFromStores([ThreadMessageStore], () =>
        ThreadMessageStore.getMostRecentMessage(channel.id)
    );

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

    return (
        <FooterSection
            className={cl("vc-better-forums-latest-message", {
                "vc-better-forums-unread": !!unreadCount && !isMuted,
                "vc-better-forums-empty-section":
                    (!mostRecentMessage && typingUsers.length === 0) || isMuted,
            })}
            icon={<Icons.ChatIcon />}
            text={messageCountText}
            onClick={clickHandler}
        >
            {isMuted ? null : typingUsers.length === 0 && mostRecentMessage ? (
                <>
                    <div className="vc-better-forums-latest-message-content">
                        <Username channel={channel} user={mostRecentMessage.author} renderColon />
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
            ) : (
                typingUsers.length > 0 && <Typing channel={channel} users={typingUsers} />
            )}
        </FooterSection>
    );
});
