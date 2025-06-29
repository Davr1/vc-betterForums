/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel } from "discord-types/general";

import { FullMessage } from "../../types";

export const useFirstMessage: (channel: Channel) => {
    loaded: boolean;
    firstMessage: FullMessage | null;
} = findByCodeLazy("loaded:", "firstMessage:", "getChannel", "getMessage");
