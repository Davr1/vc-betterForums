/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { getIntlMessage } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { findByProps, findByPropsLazy, proxyLazyWebpack } from "@webpack";
import { IconUtils, React } from "@webpack/common";
import { CustomEmoji, Emoji, UnicodeEmoji } from "@webpack/types";
import { Channel, Message } from "discord-types/general";
import { ComponentType } from "react";

import { Icons } from "./components/icons";
import { CustomTag, ThreadChannel } from "./types";

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

const EmojiUtils: {
    getURL: (emojiName: UnicodeEmoji["name"]) => UnicodeEmoji["url"];
} = findByPropsLazy("getURL", "applyPlatformToThemedEmojiColorPalette");

export function getEmojiURL(
    { name, id }: { name?: UnicodeEmoji["name"] | null; id?: CustomEmoji["id"] | null },
    size: number = 48
): string | null {
    if (id) return IconUtils.getEmojiURL({ id, animated: false, size });
    if (name) return EmojiUtils.getURL(name);
    return null;
}

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
            info: "Post is older than 30 days or it was manually archived",
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
        icon: "icon" in tag ? <tag.icon /> : null,
        custom: true,
    })) satisfies CustomTag[];
});

export const dummyChannel: Channel = proxyLazyWebpack(() => {
    const DmChannel: Channel & { new (base?: Partial<Channel>): Channel } = findByProps(
        "fromServer",
        "sortRecipients"
    );

    return Object.freeze(new DmChannel({ id: "0" }));
});

export const MessageParserUtils: {
    parse: (
        channel: Channel,
        content: string
    ) => {
        content: string;
        invalidEmojis: Emoji[];
        validNonShortcutEmojis: Emoji[];
        tts: boolean;
    };
} = findByPropsLazy("parsePreprocessor", "unparse", "parse");
