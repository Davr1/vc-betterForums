/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessageFromHash } from "@utils/discord";
import { Heading } from "@webpack/common";
import { Message } from "discord-types/general";

import { ThreadChannel, useChannelName, useForumPostState } from "../utils";
import { ForumPostContent } from "./ForumPostContent";
import { ForumPostHeader } from "./ForumPostHeader";

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

    return (
        <div className={"body"}>
            <ForumPostHeader channel={channel} />
            <div className={"headerText"}>
                <Heading
                    variant="heading-lg/semibold"
                    color={hasUnreads ? "header-primary" : "text-muted"}
                    lineClamp={2}
                    className={"postTitleText"}
                >
                    <span>
                        {channelName}
                        {isNew && (
                            <span className={"newBadgeWrapper"}>
                                <span className={"newBadge"}>
                                    {getIntlMessageFromHash("y2b7CA")}
                                </span>
                            </span>
                        )}
                    </span>
                </Heading>
            </div>
            <div className={"message"}>
                <ForumPostContent
                    channel={channel}
                    message={firstMessage}
                    content={content}
                    hasMediaAttachment={hasMediaAttachment}
                    hasUnreads={hasUnreads}
                />
            </div>
        </div>
    );
}
