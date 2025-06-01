/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel, Message } from "discord-types/general";

import { useTypingUsers } from "../utils";
import { ActiveUsers } from "./ActiveUsers";
import { Activity } from "./Activity";
import { Message as MessageComponent } from "./Message";
import { EmptyReaction, Reaction } from "./Reaction";

const TypingIndicator = findByCodeLazy('"animate-always":"animate-never"');
const TypingText = findByCodeLazy("getUserCombo(", "INTERACTIVE_NORMAL");

interface ForumPostFooterProps {
    channel: Channel;
    facepileRef: React.Ref<unknown>;
    firstMessage: Message;
}

export function ForumPostFooter({ channel, facepileRef, firstMessage }: ForumPostFooterProps) {
    const typingUsers = useTypingUsers(channel.id);
    const hasReactions = firstMessage?.reactions && firstMessage.reactions.length > 0;

    return (
        <div className={"footer"}>
            {hasReactions || !firstMessage ? null : (
                <EmptyReaction firstMessage={firstMessage} channel={channel} />
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
                        <TypingIndicator themed dotRadius={2} />
                    </div>
                    <TypingText channel={channel} className={"typingUsers"} renderDots={false} />
                </div>
            ) : (
                <Activity channel={channel} />
            )}
        </div>
    );
}
