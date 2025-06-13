/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { getIntlMessage } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { findByPropsLazy } from "@webpack";
import { React } from "@webpack/common";
import { Channel, Message } from "discord-types/general";
import { ComponentType } from "react";

import { Icons } from "./components/icons";
import { CustomTagDefinition, ThreadChannel } from "./types";

export function indexedDBStorageFactory<T>() {
    return {
        async getItem(name: string): Promise<T | null> {
            return (await DataStore.get(name)) ?? null;
        },
        async setItem(name: string, value: T): Promise<void> {
            await DataStore.set(name, value);
        },
        async removeItem(name: string): Promise<void> {
            await DataStore.del(name);
        },
    };
}

export function _memo<TProps extends object = {}>(component: ComponentType<TProps>) {
    return LazyComponent(() => React.memo(component));
}

export const Kangaroo: {
    jumpToMessage: (options: {
        channelId: Channel["id"];
        messageId: Message["id"];
        flash?: boolean;
        jumpType?: "ANIMATED" | "INSTANT";
        skipLocalFetch?: boolean;
        isPreload?: boolean;
        avoidInitialScroll?: boolean;
    }) => void;
} = findByPropsLazy("jumpToMessage");

export const threadUtils: {
    joinThread(thread: ThreadChannel): void;
    leaveThread(thread: ThreadChannel): void;
} = findByPropsLazy("joinThread", "leaveThread");

export const tagDefinitions = [
    {
        id: "new",
        name: () => getIntlMessage("NEW"),
        condition: ({ isNew }) => isNew,
        color: "blue",
    },
    {
        id: "pinned",
        name: () => getIntlMessage("PINNED_POST"),
        icon: () => <Icons.PinIcon />,
        condition: ({ isPinned }) => isPinned,
        color: "blue",
    },
    {
        id: "archived",
        name: () => getIntlMessage("THREAD_BROWSER_ARCHIVED"),
        icon: () => <Icons.ScrollIcon />,
        condition: ({ isActive }) => !isActive,
        color: "red",
    },
    {
        id: "locked",
        name: "Locked",
        icon: () => <Icons.LockIcon />,
        condition: ({ isLocked }) => isLocked,
        color: "orange",
    },
    {
        id: "abandoned",
        name: "Abandoned",
        icon: () => <Icons.NoneIcon />,
        condition: ({ isAbandoned }) => isAbandoned,
        color: "red",
    },
] as const satisfies CustomTagDefinition[];
