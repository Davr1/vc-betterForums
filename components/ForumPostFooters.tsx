/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { findComponentByCodeLazy } from "@webpack";
import { Flex, Text, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { cl } from "..";
import { ThreadMessageStore } from "../stores";
import { ThreadChannel, useMessageCount, useTypingUsers } from "../utils";
import { ChatIcon, UsersIcon } from "./icons";
import { DefaultReaction, Reaction } from "./Reaction";

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
    facepileRef: React.Ref<HTMLDivElement>;
    firstMessage: Message | null;
}

export function ForumPostFooter({ channel, facepileRef, firstMessage }: ForumPostFooterProps) {
    const typingUsers = useTypingUsers(channel.id);
    const hasReactions = firstMessage?.reactions && firstMessage.reactions.length > 0;

    const mostRecentMessage = useStateFromStores(
        [ThreadMessageStore],
        () => ThreadMessageStore.getMostRecentMessage(channel.id) ?? firstMessage
    );
    const { messageCountText, unreadCount } = useMessageCount(channel);

    return (
        <Flex className="vc-better-forums-footer">
            <ForumPostFooterSection>
                <UsersIcon />
                <Text variant="text-sm/semibold" color="currentColor">
                    7
                </Text>
            </ForumPostFooterSection>
            <ForumPostFooterSection
                className={cl("vc-better-forums-latest-message", {
                    "vc-better-forums-unread": unreadCount,
                })}
            >
                <ChatIcon />
                <Text variant="text-sm/semibold" color="currentColor">
                    {messageCountText}
                </Text>
                <Text
                    variant="text-sm/semibold"
                    color="currentColor"
                    className="vc-better-forum-latest-message-content"
                >
                    {mostRecentMessage?.author.username}: {mostRecentMessage?.content}
                </Text>
                {unreadCount && (
                    <Text variant="text-sm/semibold" color="text-brand">
                        {getIntlMessage("CHANNEL_NEW_POSTS_LABEL", {
                            count: unreadCount,
                        })}
                    </Text>
                )}
            </ForumPostFooterSection>
            {hasReactions || !firstMessage ? null : (
                <DefaultReaction firstMessage={firstMessage} channel={channel} />
            )}
            {!firstMessage ? null : <Reaction firstMessage={firstMessage} channel={channel} />}
            {/* <MessageComponent channel={channel} iconSize={14} /> */}
            {/* <span className={"bullet"}>•</span> */}
            {/* {typingUsers.length > 0 && (
                <div className={"typing"}>
                    <ActiveUsers
                        channel={channel}
                        userIds={typingUsers}
                        facepileRef={facepileRef}
                    />
                    <div className={"dots"}>
                        <ThreeDots themed dotRadius={2} />
                    </div>
                    <TypingText channel={channel} className={"typingUsers"} renderDots={false} />
                </div>
            )} */}
        </Flex>
    );
}

interface ForumPostFooterSectionProps {
    children?: React.ReactNode;
    className?: string;
}

function ForumPostFooterSection({ children, className }: ForumPostFooterSectionProps) {
    return <div className={cl("vc-better-forums-footer-section", className)}>{children}</div>;
}
