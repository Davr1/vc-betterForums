/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { filters, mapMangledModuleLazy } from "@webpack";

import { FullMessage } from "../../types";

interface ForumPostRequesterStore {
    useFirstMessage: (channel: Channel) => {
        loaded: boolean;
        firstMessage: FullMessage | null;
    };
}

export const { useFirstMessage }: ForumPostRequesterStore = mapMangledModuleLazy(
    'type:"LOAD_FORUM_POSTS"',
    { useFirstMessage: filters.byCode("firstMessage:") }
);
