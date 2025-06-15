/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@webpack/common";
import { Message } from "discord-types/general";

import { MaxReactionCount, settings } from "../../settings";
import { ThreadChannel } from "../../types";
import { _memo } from "../../utils";
import { DefaultReaction, Reactions } from "../Reaction";
import { FooterSection } from "./FooterSection";

interface FooterProps {
    channel: ThreadChannel;
    firstMessage: Message | null;
    containerWidth?: number;
}

export const Footer = _memo<FooterProps>(function Footer({
    channel,
    firstMessage,
    containerWidth,
}) {
    const { maxReactionCount, showThreadMembers } = settings.use([
        "maxReactionCount",
        "showThreadMembers",
    ]);
    const hasReactions = firstMessage?.reactions && firstMessage.reactions.length > 0;

    return (
        <Flex className="vc-better-forums-footer">
            {showThreadMembers && <FooterSection.Members channel={channel} />}
            <FooterSection.LatestMessage channel={channel} />
            {firstMessage &&
                maxReactionCount !== MaxReactionCount.OFF &&
                (hasReactions ? (
                    <Reactions
                        firstMessage={firstMessage}
                        channel={channel}
                        maxWidth={containerWidth ? containerWidth - 500 : undefined}
                        maxCount={
                            maxReactionCount !== MaxReactionCount.ALL ? maxReactionCount : undefined
                        }
                    />
                ) : (
                    <DefaultReaction firstMessage={firstMessage} channel={channel} />
                ))}
        </Flex>
    );
});
