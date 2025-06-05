/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { findComponentByCodeLazy } from "@webpack";
import { Flex, Text, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";
import { PropsWithChildren } from "react";

import { cl } from "..";
import { ThreadMessageStore } from "../stores";
import { memoizedComponent, ThreadChannel, useMessageCount, useTypingUsers } from "../utils";
import { AvatarPile } from "./AvatarPile";
import { ChatIcon, UsersIcon } from "./icons";
import { MessageContent } from "./MessageContent";
import { DefaultReaction, Reactions } from "./Reaction";
import { Username } from "./Username";

interface TypingIndicatorProps {
    dotRadius?: number;
    x?: number;
    y?: number;
    themed?: boolean;
    hide?: boolean;
    className?: string;
}

interface TypingTextProps {
    channel: Channel;
    className?: string;
    renderDots?: boolean;
}

const ThreeDots = findComponentByCodeLazy<TypingIndicatorProps>(".dots,", "dotRadius:");
const TypingText = findComponentByCodeLazy<TypingTextProps>("getTypingUsers", "INTERACTIVE_NORMAL");

interface ForumPostFooterProps {
    channel: ThreadChannel;
    firstMessage: Message | null;
}

export function ForumPostFooter({ channel, firstMessage }: ForumPostFooterProps) {
    const hasReactions = firstMessage?.reactions && firstMessage.reactions.length > 0;

    return (
        <Flex className="vc-better-forums-footer">
            <ForumPostMembersSection channel={channel} />
            <ForumPostLatestMessageSection channel={channel} />
            {firstMessage &&
                (hasReactions ? (
                    <Reactions firstMessage={firstMessage} channel={channel} />
                ) : (
                    <DefaultReaction firstMessage={firstMessage} channel={channel} />
                ))}
        </Flex>
    );
}

interface ForumPostFooterSectionProps extends PropsWithChildren {
    className?: string;
    icon?: React.ReactNode;
    text?: string;
}

function ForumPostFooterSection({ children, className, icon, text }: ForumPostFooterSectionProps) {
    return (
        <div className={cl("vc-better-forums-footer-section", className)}>
            {icon}
            <Text
                variant="text-sm/semibold"
                color="currentColor"
                className="vc-better-forums-footer-section-text"
            >
                {text}
            </Text>
            {children}
        </div>
    );
}

function ForumPostSpacerSection() {
    return <div className="vc-better-forums-spacer" />;
}

interface ForumPostMembersSectionProps {
    channel: ThreadChannel;
}

const ForumPostMembersSection = memoizedComponent<ForumPostMembersSectionProps>(
    function ForumPostMembersSection({ channel }) {
        return (
            <ForumPostFooterSection icon={<UsersIcon />} text={channel.memberCount.toString()}>
                {channel.memberIdsPreview.length > 0 && (
                    <AvatarPile
                        guildId={channel.getGuildId()}
                        userIds={channel.memberIdsPreview}
                        size={16}
                        count={channel.memberCount}
                    />
                )}
            </ForumPostFooterSection>
        );
    }
);

const renderTypingIndicator = () => (
    <ThreeDots themed dotRadius={2} className="vc-better-forums-typing-indicator" />
);

interface ForumPostLatestMessageSectionProps {
    channel: ThreadChannel;
}

const ForumPostLatestMessageSection = memoizedComponent<ForumPostLatestMessageSectionProps>(
    function ForumPostLatestMessageSection({ channel }) {
        const mostRecentMessage = useStateFromStores([ThreadMessageStore], () =>
            ThreadMessageStore.getMostRecentMessage(channel.id)
        );
        const { messageCount, messageCountText, unreadCount, unreadCountText } = useMessageCount(
            channel.id
        );
        const typingUsers = useTypingUsers(channel.id);

        if (messageCount === 0 && typingUsers.length === 0) return <ForumPostSpacerSection />;

        return (
            <ForumPostFooterSection
                className={cl("vc-better-forums-latest-message", {
                    "vc-better-forums-unread": unreadCount,
                    "vc-better-forums-empty-section":
                        !mostRecentMessage && typingUsers.length === 0,
                })}
                icon={<ChatIcon />}
                text={messageCountText}
            >
                {typingUsers.length === 0 && mostRecentMessage ? (
                    <>
                        <Text
                            variant="text-sm/semibold"
                            color="currentColor"
                            className="vc-better-forum-latest-message-content"
                        >
                            <Username channel={channel} message={mostRecentMessage} renderColon />{" "}
                            <MessageContent
                                channel={channel}
                                message={mostRecentMessage}
                                messageClassName="vc-better-forums-message-content-inline"
                                color="currentColor"
                                tag="span"
                                lineClamp={1}
                            />
                        </Text>
                        {unreadCount !== null && (
                            <Text variant="text-sm/semibold" color="text-brand">
                                {getIntlMessage("CHANNEL_NEW_POSTS_LABEL", {
                                    count: unreadCountText,
                                })}
                            </Text>
                        )}
                    </>
                ) : (
                    typingUsers.length > 0 && (
                        <div className="vc-better-forums-typing">
                            <AvatarPile
                                guildId={channel.getGuildId()}
                                userIds={typingUsers}
                                size={16}
                                max={typingUsers.length}
                                renderMoreUsers={renderTypingIndicator}
                            />
                            <TypingText
                                channel={channel}
                                renderDots={false}
                                className="vc-better-forums-typing-text"
                            />
                        </div>
                    )
                )}
            </ForumPostFooterSection>
        );
    }
);
