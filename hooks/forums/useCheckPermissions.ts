/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PermissionsBits } from "@webpack/common";
import { Channel } from "discord-types/general";

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
    | `disableReaction${"Reads" | "Creates" | "Updates"}`
    | `is${"Lurking" | "Guest" | "PendingMember"}`,
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

    const canAddNewReactions = PermissionStore.use(
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
            isPendingMember: false,
        };

    const isPrivate = channel.isPrivate();
    const isSystemDM = channel.isSystemDM();
    const active = (canChat || isPrivate) && isActiveChannelOrUnarchivableThread;

    return {
        disableReactionReads: false,
        disableReactionCreates:
            isLurking ||
            isGuest ||
            !active ||
            !(
                (canAddNewReactions || isPrivate) &&
                !isSystemDM &&
                isActiveChannelOrUnarchivableThread
            ),
        disableReactionUpdates: isLurking || isGuest || !active,
        isLurking,
        isGuest,
        isPendingMember: false,
    };
}
