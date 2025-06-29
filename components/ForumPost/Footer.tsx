/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@webpack/common";

import { MaxReactionCount, settings } from "../../settings";
import { FullMessage, ThreadChannel } from "../../types";
import { _memo } from "../../utils";
import { DefaultReaction, Reactions } from "../Reaction";
import { FooterSection } from "./FooterSection";

interface FooterProps {
    channel: ThreadChannel;
    message: FullMessage | null;
    containerWidth?: number;
}

export const Footer = _memo<FooterProps>(function Footer({ channel, message, containerWidth = 0 }) {
    const { maxReactionCount, showThreadMembers } = settings.use([
        "maxReactionCount",
        "showThreadMembers",
    ]);

    const maxCount = maxReactionCount !== MaxReactionCount.ALL ? maxReactionCount : undefined;

    const hasReactions = message?.reactions && message.reactions.length > 0;

    return (
        <Flex className="vc-better-forums-footer">
            {showThreadMembers && <FooterSection.Members channel={channel} />}
            <FooterSection.LatestMessage channel={channel} />
            {message &&
                maxReactionCount !== MaxReactionCount.OFF &&
                (hasReactions ? (
                    <Reactions
                        firstMessage={message}
                        channel={channel}
                        maxWidth={containerWidth - 500}
                        maxCount={maxCount}
                    />
                ) : (
                    <DefaultReaction firstMessage={message} channel={channel} />
                ))}
        </Flex>
    );
});
