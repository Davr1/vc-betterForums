/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect, UserStore, useStateFromStores } from "@webpack/common";
import { Message } from "discord-types/general";

import { GuildMemberRequesterStore } from "../stores";
import { ThreadChannel } from "../types";
import { useMember } from "./useMember";

export function useAuthor(channel: ThreadChannel, message?: Message | null) {
    const owner = useStateFromStores([UserStore], () => UserStore.getUser(channel.ownerId), [
        channel.ownerId,
    ]);

    const author = useMember(message?.author ?? (message ? null : owner), channel);

    useEffect(() => {
        message?.author?.id &&
            GuildMemberRequesterStore.requestMember(channel.guild_id, message.author?.id);
    }, [channel.guild_id, message?.author?.id]);

    return author;
}
