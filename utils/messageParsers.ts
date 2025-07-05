/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { parseUrl } from "@utils/misc";
import { Parser } from "@webpack/common";
import { ReactNode } from "react";

import { KeywordFilterStore } from "../stores";
import {
    ASTNode,
    ASTNodeType,
    EmbedType,
    EmojiASTNode,
    FullEmbed,
    FullMessage,
    LinkASTNode,
    ListASTNode,
    ParagraphASTNode,
    ParseFn,
    ParserOptions,
} from "../types";
import { pipe } from "./";

const imageTypes = new Set([EmbedType.IMAGE, EmbedType.GIFV]);
const allowedTypes = new Set([
    ASTNodeType.STRONG,
    ASTNodeType.ITALICS,
    ASTNodeType.UNDERLINE,
    ASTNodeType.TEXT,
    ASTNodeType.INLINE_CODE,
    ASTNodeType.STRIKETHROUGH,
    ASTNodeType.SPOILER,
]);

function getFullOptions(message: FullMessage, options: Partial<ParserOptions>): ParserOptions {
    const isWebhook = !!message.webhookId;

    return {
        channelId: message.getChannelId(),
        messageId: message.id,
        allowDevLinks: !!options.allowDevLinks,
        formatInline: !!options.formatInline,
        noStyleAndInteraction: !!options.noStyleAndInteraction,
        allowHeading: !!options.allowHeading,
        allowList: !!options.allowList,
        previewLinkTarget: !!options.previewLinkTarget,
        disableAnimatedEmoji: !!options.disableAnimatedEmoji,
        isInteracting: !!options.isInteracting,
        disableAutoBlockNewlines: true,
        muted: false,
        unknownUserMentionPlaceholder: true,
        viewingChannelId: options.viewingChannelId,
        forceWhite: !!options.forceWhite,
        allowLinks: isWebhook || options.allowLinks,
        allowEmojiLinks: isWebhook,
        mentionChannels: message.mentionChannels,
        soundboardSounds: message.soundboardSounds ?? [],
    };
}

const punctuationsRegex = /[\p{Pd}\p{Pc}\p{Po}]/gu;

const replacements = Object.freeze({
    "-": "-",
    " ": " ",
    "[": " ",
    "]": " ",
    "(": " ",
    ")": " ",
    "|": " ",
    "~": " ",
    "\u200b": "",
    "\u200c": "",
    "\u200d": "",
    "\u200e": "",
    "\uFEFF": "",
});

function normalize(text: string): string {
    return [...text.toLowerCase()]
        .map(char => replacements[char] ?? (punctuationsRegex.test(char) ? " " : char))
        .join("")
        .trim();
}

function replaceKeywords(text: string, options: { escapeReplacement?: boolean }): string {
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

type HostAndPath = Record<"host" | "pathPrefix", string | null>;

function getRemainingPath({ host, pathPrefix }: HostAndPath, url: URL | null): string | null {
    if (!url) return null;

    if (url.host.replace(/^www[.]/i, "") !== host) return null;
    const [path, prefix] = [url.pathname, pathPrefix ?? ""];

    if (!path.startsWith(prefix)) return null;
    return path.substring(prefix.length) || null;
}

const questsRegex = /^\/quests\/([0-9-]+)\/?$/;

const BASE_URL = "discord.com";
const getHosts = () =>
    Object.freeze({
        WEBAPP: getHostAndPath(window.GLOBAL_ENV.WEBAPP_ENDPOINT ?? `//canary.${BASE_URL}`),
        CANARY: getHostAndPath(`//canary.${BASE_URL}`),
        PTB: getHostAndPath(`//ptb.${BASE_URL}`),
        LEGACY: getHostAndPath("discordapp.com"),
        DISCORD: getHostAndPath(BASE_URL),
    });

function getHostAndPath(url: string): HostAndPath {
    if (url.startsWith("//")) url = `${location.protocol}${url}`;
    const parsedUrl = parseUrl(url);

    return {
        host: parsedUrl?.host ?? url,
        pathPrefix: parsedUrl?.pathname ?? (url.startsWith("/") ? url : null),
    };
}

function matchQuestPath(target: string): string | null {
    const url = parseUrl(target);
    if (!url?.pathname) return null;

    const primaryHostRemainingPath = Object.values(getHosts())
        .map(source => getRemainingPath(source, url))
        .find(Boolean);

    return primaryHostRemainingPath?.match(questsRegex)?.[1] ?? null;
}

type PostProcessor = (
    tree: ASTNode[],
    inline: boolean,
    message: FullMessage
) => ASTNode[] | void | null;

const definePostProcessor = (fn: PostProcessor) => fn;

interface CustomOptions extends ParserOptions {
    postProcessor?: PostProcessor;
    shouldFilterKeywords?: boolean;
    hideSimpleEmbedContent?: boolean;
    contentMessage?: FullMessage | null;
}

function hasMedia({ image, video, type, author, rawTitle }: FullEmbed): boolean {
    if (!imageTypes.has(type)) return false;
    if (!image && !video) return false;

    return type === EmbedType.GIFV || (type !== EmbedType.RICH && !author && !rawTitle);
}

const removeSimpleEmbeds = definePostProcessor((tree, _, { embeds }) => {
    if (tree.length !== 1 || embeds.length !== 1) return;

    const [firstNode] = tree,
        [firstEmbed] = embeds;

    if (!isLink(firstNode)) return;

    if (hasMedia(firstEmbed)) return [];
});

const jumboifyEmojis = definePostProcessor((tree, inline) => {
    if (inline) return jumboifyLine(tree);

    const [firstNode] = tree;
    if (isParagraph(firstNode)) {
        firstNode.content = jumboifyLine(firstNode.content as ASTNode[]);
    }
});

const removeQuestLinks = definePostProcessor(tree => {
    const hasAllLinks = tree.every(isExternalLink);
    return tree.filter(
        node => !(isExternalLink(node) && matchQuestPath(node.target) && hasAllLinks)
    );
});

const toInlineText = definePostProcessor((tree, ...rest) => {
    tree.forEach(node => {
        if (!allowedTypes.has(node.type) || !node.content) return;

        if (Array.isArray(node.content)) {
            toInlineText(node.content, ...rest);
        } else if (typeof node.content === "string") {
            node.content = node.content.replace(/\n/g, " ");
        }
    });
});

export function parseInlineContent(
    message?: FullMessage | null,
    options: CustomOptions = {}
): { hasSpoilerEmbeds: boolean; content: ReactNode } {
    if (!message)
        return {
            hasSpoilerEmbeds: false,
            content: null,
        };

    const {
        hideSimpleEmbedContent = true,
        formatInline = false,
        postProcessor,
        shouldFilterKeywords,
        contentMessage,
    } = options;

    const fullMessage = contentMessage ?? message;
    const textContent = shouldFilterKeywords
        ? replaceKeywords(fullMessage.content, { escapeReplacement: true })
        : fullMessage.content;

    const parserFn: ParseFn = formatInline ? Parser.parseInlineReply : Parser.parse;

    let spoilerEmbeds = false;

    const parsedContent = parserFn(
        textContent,
        formatInline,
        getFullOptions(message, options),
        (tree, inline) => {
            if (!Array.isArray(tree)) tree = [tree];
            spoilerEmbeds = hasSpoilerEmbeds(tree, inline, fullMessage);

            return pipe(
                [tree, inline, fullMessage],
                hideSimpleEmbedContent && removeSimpleEmbeds,
                !formatInline && jumboifyEmojis,
                removeQuestLinks,
                formatInline && toInlineText,
                postProcessor
            );
        }
    );
    return {
        hasSpoilerEmbeds: spoilerEmbeds,
        content: parsedContent,
    };
}

function hasSpoilerEmbeds(tree: ASTNode[], inline: boolean, message: FullMessage): boolean {
    if (message.embeds.length === 0) return false;

    if (inline) return hasSpoilerContent(tree);

    const [firstNode] = tree;
    return isParagraph(firstNode) && hasSpoilerContent(firstNode.content);
}

function isParagraph(node: ASTNode): node is ParagraphASTNode {
    return node.type === ASTNodeType.PARAGRAPH && Array.isArray(node.content);
}

function isEmoji(node: ASTNode): node is EmojiASTNode {
    return (
        node.type === ASTNodeType.EMOJI ||
        node.type === ASTNodeType.CUSTOM_EMOJI ||
        node.type === ASTNodeType.SOUNDBOARD
    );
}

function isLink(node: ASTNode) {
    return isExternalLink(node) || node.type === ASTNodeType.ATTACHMENT_LINK;
}

function isExternalLink(node: ASTNode): node is LinkASTNode {
    return node.type === ASTNodeType.LINK;
}

function isList(node: ASTNode): node is ListASTNode {
    return node.type === ASTNodeType.LIST && Array.isArray(node.items);
}

function jumboifyLine(tree: ASTNode[]): ASTNode[] {
    const emojiNodes: EmojiASTNode[] = [];
    for (const node of tree) {
        if (isEmoji(node)) {
            emojiNodes.push(node);
        } else if (typeof node.content !== "string" || !!node.content.trim()) {
            return tree;
        }
    }

    if (emojiNodes.length <= 30)
        emojiNodes.forEach(node => {
            node.jumboable = true;
        });

    return tree;
}
function treeWalker(tree: ASTNode | ASTNode[], cb: (node: ASTNode) => boolean | null): boolean {
    if (Array.isArray(tree)) {
        return tree.some(item => treeWalker(item, cb));
    }

    const match = cb(tree);
    if (match) return match;

    if (Array.isArray(tree.content)) {
        return treeWalker(tree.content, cb);
    }

    return isList(tree) && tree.items.some(item => treeWalker(item, cb));
}

function hasSpoilerContent(content: ASTNode[]): boolean {
    return treeWalker(content, item => {
        if (item.type !== ASTNodeType.SPOILER) return null;
        return treeWalker(item, node => isLink(node) || null);
    });
}
