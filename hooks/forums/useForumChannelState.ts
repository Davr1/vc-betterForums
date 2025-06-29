/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "discord-types/general";

import { ChannelState, ChannelStore, LayoutType, SortOrder, TagSetting } from "../../stores";
import { useForumChannelStore } from "../index";

function getDefaultChannelState(): ChannelState {
    return {
        layoutType: LayoutType.LIST,
        sortOrder: SortOrder.CREATION_DATE,
        tagFilter: new Set(),
        scrollPosition: 0,
        tagSetting: TagSetting.MATCH_SOME,
    };
}

export function useForumChannelState(channelId: Channel["id"]): ChannelState {
    const channel = ChannelStore.use($ => $.getChannel(channelId), [channelId]);
    const channelState = useForumChannelStore()?.getChannelState(channelId);

    return !channel || !channelState ? getDefaultChannelState() : channelState;
}
