/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, User } from "@vencord/discord-types";

import { BaseTextProps } from "@components/BaseText";
import { _memo } from "../utils";
import { AvatarPile } from "./AvatarPile";
import { ThreeDots } from "./ThreeDots";
import { TypingText } from "./TypingText";

const renderTypingIndicator = () => (
    <ThreeDots themed dotRadius={2} className="vc-better-forums-typing-indicator" />
);

interface TypingProps extends BaseTextProps {
    channel: Channel;
    users: User["id"][];
}

export const Typing = _memo<TypingProps>(function Typing({ channel, users, ...props }) {
    return (
        <div className="vc-better-forums-typing">
            <AvatarPile
                guildId={channel.getGuildId()}
                userIds={users}
                size={16}
                max={users.length}
                renderMoreUsers={renderTypingIndicator}
            />
            <TypingText
                channel={channel}
                className="vc-better-forums-typing-text"
                userIds={users}
                {...props}
            />
        </div>
    );
});
