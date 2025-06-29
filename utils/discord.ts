/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalAPI } from "@utils/modal";
import { findByCodeLazy, findByPropsLazy } from "@webpack";
import { FluxDispatcher, IconUtils } from "@webpack/common";
import { CustomEmoji, UnicodeEmoji } from "@webpack/types";
import { Channel, Message } from "discord-types/general";

import { ParsedContent, ThreadChannel, UnfurledMediaItem } from "../types";

export const MessageUtils: {
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

export const ThreadUtils: {
    joinThread(thread: ThreadChannel): void;
    leaveThread(thread: ThreadChannel): void;
} = findByPropsLazy("joinThread", "leaveThread");

export const EmojiUtils: {
    getURL: (emojiName: UnicodeEmoji["name"]) => UnicodeEmoji["url"];
} = findByPropsLazy("getURL", "applyPlatformToThemedEmojiColorPalette");

export const MessageParserUtils: {
    parse: (channel: Channel, content: string) => ParsedContent;
} = findByPropsLazy("parsePreprocessor", "unparse", "parse");

export const openMediaViewer: (options: {
    items: Partial<UnfurledMediaItem>[];
    shouldHideMediaOptions?: boolean;
    location?: string;
    contextKey?: "default" | "popout";
    startingIndex?: number;
}) => void = findByCodeLazy("shouldHideMediaOptions", "LIGHTBOX");

export function closeAllScreens(): void {
    ModalAPI.closeAllModals();
    FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
}

export function getEmojiURL(
    { name, id }: { name?: UnicodeEmoji["name"] | null; id?: CustomEmoji["id"] | null },
    size: number = 48
): string | null {
    if (id) return IconUtils.getEmojiURL({ id, animated: false, size });
    if (name) return EmojiUtils.getURL(name);
    return null;
}
