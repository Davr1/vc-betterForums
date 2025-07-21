/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalAPI } from "@utils/modal";
import { Channel, CustomEmoji, Message, UnicodeEmoji } from "@vencord/discord-types";
import { findByCodeLazy, findByPropsLazy } from "@webpack";
import { FluxDispatcher, IconUtils } from "@webpack/common";

import { KeywordFilterStore } from "../stores";
import { ParsedContent, ThreadChannel, UnfurledMediaItem } from "../types";
import { normalize } from "./";

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

export function replaceKeywords(text: string, options: { escapeReplacement?: boolean }): string {
    const normalized = normalize(text);
    if (!normalized) return text;

    const replacement = options?.escapeReplacement ? "\\*" : "*";

    const keywordTrie = KeywordFilterStore.getKeywordTrie();
    const keywords = Object.values(keywordTrie?.search(normalized) ?? {});

    return keywords
        .sort((a, b) => b.start - a.start)
        .reduce((content, { start, end }) => {
            const from = Math.max(start, 0);
            const to = Math.min(end, content.length - 1);

            const before = content.substring(0, from);
            const after = content.substring(to + 1);

            const maskedKeyword = [...content.substring(from, to + 1)]
                .map(char => (char === " " ? " " : replacement))
                .join("");

            return `${before}${maskedKeyword}${after}`;
        }, text);
}
