/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel, Guild, User } from "discord-types/general";
import { Message } from "esbuild";
import { ReactNode } from "react";

import { useAuthor } from "../hooks";

export const useUsernameHook: (
    options: Partial<{
        user: User;
        channelId: Channel["id"];
        guildId: Guild["id"];
        messageId: Message["id"];
        stopPropagation: boolean;
    }>
) => (
    author: ReturnType<typeof useAuthor>
) => (username: string, channelId: Channel["id"]) => ReactNode = findByCodeLazy("useUsernameHook");
