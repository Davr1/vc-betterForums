/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { filters } from "@webpack";

import { FullMessage, ThreadChannel } from "../../types";
import { findSingleExportLazy } from "../../utils";

export const useFirstMessage = findSingleExportLazy<
    (channel: ThreadChannel) => {
        loaded: boolean;
        firstMessage: FullMessage | null;
    }
>('type:"LOAD_FORUM_POSTS"', filters.byCode("firstMessage:"));
