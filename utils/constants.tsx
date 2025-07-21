/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { Channel } from "@vencord/discord-types";
import { findByProps, proxyLazyWebpack } from "@webpack";

import { Icons } from "../components/icons";
import { ChannelState, LayoutType, SortOrder, TagSetting } from "../stores";
import { CustomTag } from "../types";

export const tagDefinitions = proxyLazyWebpack(() => {
    const tags = [
        {
            id: "new",
            name: getIntlMessage("NEW"),
            condition: ({ isNew }) => isNew,
            color: "blue",
        },
        {
            id: "pinned",
            name: getIntlMessage("PINNED_POST"),
            icon: Icons.Pin,
            condition: ({ isPinned }) => isPinned,
            color: "blue",
        },
        {
            id: "archived",
            name: getIntlMessage("THREAD_BROWSER_ARCHIVED"),
            info: "Post is older than 30 days",
            icon: Icons.Scroll,
            condition: ({ isActive }) => !isActive,
            color: "neutral",
        },
        {
            id: "locked",
            name: "Locked",
            icon: Icons.Lock,
            condition: ({ isLocked }) => isLocked,
            color: "orange",
        },
        {
            id: "abandoned",
            name: "Abandoned",
            info: "Original poster left the server",
            icon: Icons.None,
            condition: ({ isAbandoned }) => isAbandoned,
            color: "red",
        },
    ] as const;

    return tags.map(tag => ({
        ...tag,
        icon: "icon" in tag ? <tag.icon size={14} /> : null,
        custom: true,
    })) satisfies CustomTag[];
});

export const dummyChannel: Channel = proxyLazyWebpack(() => {
    const DmChannel: Channel & { new(base?: Partial<Channel>): Channel; } = findByProps(
        "fromServer",
        "sortRecipients"
    );

    return Object.freeze(new DmChannel({ id: "0" }));
});

export const defaultChannelState: ChannelState = Object.freeze({
    layoutType: LayoutType.LIST,
    sortOrder: SortOrder.CREATION_DATE,
    tagFilter: new Set<string>(),
    scrollPosition: 0,
    tagSetting: TagSetting.MATCH_SOME,
});

const BASE_URL = "discord.com";

export const Host = Object.freeze({
    get WEBAPP() {
        return window.GLOBAL_ENV.WEBAPP_ENDPOINT ?? `//canary.${BASE_URL}`;
    },
    get CANARY() {
        return `//canary.${BASE_URL}`;
    },
    get PTB() {
        return `//ptb.${BASE_URL}`;
    },
    get LEGACY() {
        return "discordapp.com";
    },
    get DISCORD() {
        return BASE_URL;
    },
});
