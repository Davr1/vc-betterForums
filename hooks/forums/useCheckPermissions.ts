/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { PermissionsBits } from "@webpack/common";

import {
    GuildMemberStore,
    GuildVerificationStore,
    LurkingStore,
    PermissionStore,
} from "../../stores";
import { useIsActiveChannelOrUnarchivableThread } from "./useIsActiveChannelOrUnarchivableThread";

export function useCheckPermissions(
    channel: Channel
): Record<
    `disableReaction${"Reads" | "Creates" | "Updates"}` | `is${"Lurking" | "Guest"}`,
    boolean
> {
    const guildId = channel?.getGuildId();

    const canChat = GuildVerificationStore.use(
        $ => !guildId || $.canChatInGuild(guildId),
        [guildId]
    );

    const isLurking = LurkingStore.use($ => !!guildId && $.isLurking(guildId), [guildId]);

    const isGuest = GuildMemberStore.use(
        $ => !!guildId && $.isCurrentUserGuest(guildId),
        [guildId]
    );

    const canAddReactions = PermissionStore.use(
        $ => canChat && $.can(PermissionsBits.ADD_REACTIONS, channel),
        [canChat, channel]
    );

    const isActiveChannelOrUnarchivableThread = useIsActiveChannelOrUnarchivableThread(channel);

    if (!channel)
        return {
            disableReactionReads: true,
            disableReactionCreates: true,
            disableReactionUpdates: true,
            isLurking: false,
            isGuest: false,
        };

    const isPrivate = channel.isPrivate();
    const isSystemDM = channel.isSystemDM();
    const active = (canChat || isPrivate) && isActiveChannelOrUnarchivableThread;

    const canAddNewReactions =
        (canAddReactions || isPrivate) && !isSystemDM && isActiveChannelOrUnarchivableThread;

    const disableReactionUpdates = isLurking || isGuest || !active;

    return {
        disableReactionReads: false,
        disableReactionCreates: disableReactionUpdates || !canAddNewReactions,
        disableReactionUpdates,
        isLurking,
        isGuest,
    };
}
