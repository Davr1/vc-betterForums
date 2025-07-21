/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";

import { ChannelState, ChannelStore } from "../../stores";
import { defaultChannelState } from "../../utils";
import { useForumChannelStore } from "../index";

export function useForumChannelState(channelId: Channel["id"]): ChannelState {
    const channel = ChannelStore.use($ => $.getChannel(channelId), [channelId]);
    const channelState = useForumChannelStore()?.getChannelState(channelId);

    return !channel || !channelState ? defaultChannelState : channelState;
}
