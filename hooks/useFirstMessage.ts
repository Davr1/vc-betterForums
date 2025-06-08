/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel, Message } from "discord-types/general";

export const useFirstMessage: (channel: Channel) => {
    loaded: boolean;
    firstMessage: Message | null;
} = findByCodeLazy("loaded:", "firstMessage:", "getChannel", "getMessage");
