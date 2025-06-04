/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Flex, Heading, Text, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { RelationshipStore } from "../stores";
import { ThreadChannel, useChannelName, useForumPostState } from "../utils";
import { ForumPostContent } from "./ForumPostContent";
import { ForumPostTags } from "./ForumPostTags";
import { ForumPostTimestamp } from "./ForumPostTimestamp";

interface UsernameProps {
    message: Message | null;
    channel: Channel;
    renderColon?: boolean;
    hasUnreads?: boolean;
}
const Username = findComponentByCodeLazy<UsernameProps>("#{intl::FORUM_POST_AUTHOR_A11Y_LABEL}");

interface ForumPostBodyProps {
    channel: ThreadChannel;
    firstMessage: Message | null;
    content: React.ReactNode;
    hasMediaAttachment: boolean;
}

export function ForumPostBody({
    channel,
    firstMessage,
    content,
    hasMediaAttachment,
}: ForumPostBodyProps) {
    const { isNew, hasUnreads } = useForumPostState(channel);
    const channelName = useChannelName(channel);

    const { isBlocked, isIgnored } = useStateFromStores([RelationshipStore], () => ({
        isBlocked: !!firstMessage && RelationshipStore.isBlockedForMessage(firstMessage),
        isIgnored: !!firstMessage && RelationshipStore.isIgnoredForMessage(firstMessage),
    }));

    return (
        <Flex className="vc-better-forums-thread-body" direction={Flex.Direction.VERTICAL}>
            <Flex className="vc-better-forums-thread-header" align={Flex.Align.CENTER} grow={0}>
                <Username
                    channel={channel}
                    message={firstMessage}
                    renderColon={false}
                    hasUnreads={hasUnreads}
                />
                <ForumPostTimestamp channel={channel} />
            </Flex>
            <div className={"headerText"}>
                <Heading
                    variant="heading-lg/semibold"
                    color="header-primary"
                    className="vc-better-forums-thread-title-container"
                >
                    <Text lineClamp={2}>{channelName}</Text>
                    <ForumPostTags channel={channel} isNew={isNew} />
                    {/* {isNew && (
                            <span className={"newBadgeWrapper"}>
                                <span className={"newBadge"}>
                                    {getIntlMessageFromHash("y2b7CA")}
                                </span>
                            </span>
                        )} */}
                </Heading>
            </div>
            <ForumPostContent
                channel={channel}
                message={firstMessage}
                content={content}
                hasMediaAttachment={hasMediaAttachment}
                hasUnreads={hasUnreads}
                isAuthorBlocked={isBlocked}
                isAuthorIgnored={isIgnored}
            />
        </Flex>
    );
}
