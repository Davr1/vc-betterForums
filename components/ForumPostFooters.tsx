/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Channel, Message } from "discord-types/general";

import { ThreadChannel, useTypingUsers } from "../utils";
import { ActiveUsers } from "./ActiveUsers";
import { Activity } from "./Activity";
import { Message as MessageComponent } from "./Message";
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

    return (
        <div className={"footer"}>
            {hasReactions || !firstMessage ? null : (
                <DefaultReaction firstMessage={firstMessage} channel={channel} />
            )}
            {!firstMessage ? null : <Reaction firstMessage={firstMessage} channel={channel} />}
            <MessageComponent channel={channel} iconSize={14} />
            <span className={"bullet"}>•</span>
            {typingUsers.length > 0 ? (
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
            ) : (
                <Activity channel={channel} />
            )}
        </div>
    );
}
