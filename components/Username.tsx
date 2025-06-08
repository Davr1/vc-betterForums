/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text } from "@webpack/common";
import { Message } from "discord-types/general";

import { useAuthor, useUsernameHook } from "../hooks";
import { ThreadChannel } from "../types";
import { _memo } from "../utils";

interface UsernameProps {
    message?: Message | null;
    channel: ThreadChannel;
    renderColon?: boolean;
}

export const Username = _memo<UsernameProps>(function Username({ message, channel, renderColon }) {
    const author = useAuthor(channel, message);
    const username = author?.nick ?? "";

    const useUsername = useUsernameHook({
        user: message?.author,
        channelId: channel.id,
        guildId: channel.guild_id,
        messageId: message?.id,
        stopPropagation: true,
    });

    const usernameElement = useUsername(author)(username, channel.id);

    return (
        <Text
            tag="span"
            className="vc-better-forums-username"
            variant="text-sm/semibold"
            color="currentColor"
        >
            {usernameElement}
            {renderColon ? ": " : null}
        </Text>
    );
});
