/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel, Guild, Message, User } from "discord-types/general";
import { ReactNode } from "react";

import { Member } from "../../types";

export const useUsernameHook: (
    options: Partial<{
        user: User | null;
        channelId: Channel["id"];
        guildId: Guild["id"];
        messageId: Message["id"];
        stopPropagation: boolean;
    }>
) => (member: Member) => (username: string, channelId: Channel["id"]) => ReactNode = findByCodeLazy(
    ".USERNAME",
    "stopPropagation:"
);
