/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Text, useEffect, UserStore, useStateFromStores } from "@webpack/common";
import { Channel, Guild, Message, User } from "discord-types/general";

import { GuildMemberRequesterStore } from "../stores";
import { memoizedComponent, ThreadChannel, useMember } from "../utils";

function useAuthor(channel: ThreadChannel, message?: Message | null) {
    const owner = useStateFromStores([UserStore], () =>
        message ? null : UserStore.getUser(channel.ownerId)
    );

    const author = useMember(message?.author ?? owner, channel);

    useEffect(() => {
        message?.author?.id &&
            GuildMemberRequesterStore.requestMember(channel.guild_id, message.author?.id);
    }, [channel.guild_id, message?.author?.id]);

    return author;
}

const useUsernameHook: (
    options: Partial<{
        user: User;
        channelId: Channel["id"];
        guildId: Guild["id"];
        messageId: Message["id"];
        stopPropagation: boolean;
    }>
) => (
    author: ReturnType<typeof useAuthor>
) => (username: string, channelId: Channel["id"]) => React.ReactNode =
    findByCodeLazy("useUsernameHook");

interface UsernameProps {
    message?: Message | null;
    channel: ThreadChannel;
    renderColon?: boolean;
}

export const Username = memoizedComponent<UsernameProps>(function Username({
    message,
    channel,
    renderColon,
}) {
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
        <Text tag="span" className="vc-better-forums-username" variant="text-sm/semibold">
            {usernameElement}
            {renderColon ? ": " : null}
        </Text>
    );
});
