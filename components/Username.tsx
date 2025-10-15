/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText, BaseTextProps } from "@components/BaseText";
import { Channel, Message, User } from "@vencord/discord-types";

import { cl } from "..";
import { useMember, useUsernameHook } from "../hooks";
import { _memo } from "../utils";
import { Badge } from "./Badge";

interface UsernameProps extends BaseTextProps {
    user: User | null;
    message?: Message | null;
    channel: Channel;
    renderColon?: boolean;
    renderBadge?: boolean;
}

export const Username = _memo<UsernameProps>(function Username({
    user,
    message,
    channel,
    renderColon,
    renderBadge,
    className,
    style,
    ...props
}) {
    const member = useMember(user, channel);
    const username = member?.nick ?? "";

    const useUsername = useUsernameHook({
        user,
        channelId: channel.id,
        guildId: channel.getGuildId(),
        messageId: message?.id,
        stopPropagation: true,
    });

    const usernameElement = useUsername(member)(username, channel.id);

    return (
        <BaseText
            tag="span"
            className={cl("vc-better-forums-username", className)}
            size="sm"
            weight="semibold"
            style={{ color: "currentcolor", ...style }}
            {...props}
        >
            {usernameElement}
            {user && renderBadge ? (
                <div className="vc-better-forums-badge-container">
                    <Badge message={message} channel={channel} user={user} compact />
                </div>
            ) : null}
            {renderColon ? ": " : null}
        </BaseText>
    );
});
