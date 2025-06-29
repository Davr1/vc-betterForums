/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PermissionsBits } from "@webpack/common";
import { Channel } from "discord-types/general";

import { PermissionStore } from "../../stores";

export function useIsActiveChannelOrUnarchivableThread(channel: Channel | null): boolean {
    const canSendMessagesInThreads = PermissionStore.use(
        $ => !!channel && $.can(PermissionsBits.SEND_MESSAGES_IN_THREADS, channel),
        [channel]
    );

    if (!channel) return false;

    if (!channel.isThread() || channel.isActiveThread()) return true;

    return (
        channel.isArchivedThread() &&
        channel.threadMetadata?.locked !== true &&
        canSendMessagesInThreads
    );
}
