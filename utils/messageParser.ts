/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { parseUrl } from "@utils/misc";
import { Parser } from "@webpack/common";
import { ReactNode } from "react";

import {
    ASTNode,
    ASTNodeType,
    EmbedType,
    EmojiASTNode,
    FullEmbed,
    FullMessage,
    ParseFn,
    ParserOptions,
} from "../types";
import { Host, pipe, replaceKeywords } from "./";
import { isEmoji, isExternalLink, isLink, isParagraph, treeWalker } from "./ast";
import { getHostAndPath, getRemainingPath } from "./text";

const imageTypes = new Set([EmbedType.IMAGE, EmbedType.GIFV]);
const textNodeTypes = new Set([
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

const removeSimpleEmbeds = definePostProcessor((tree, _, { embeds }) => {
    if (tree.length !== 1 || embeds.length !== 1) return;

    const [firstNode] = tree;
    if (!isLink(firstNode)) return;

    const [firstEmbed] = embeds;
    if (hasMedia(firstEmbed)) return []; // empty tree

    function hasMedia({ image, video, type, author, rawTitle }: FullEmbed): boolean {
        if (!imageTypes.has(type)) return false;
        if (!image && !video) return false;

        return type === EmbedType.GIFV || (type !== EmbedType.RICH && !author && !rawTitle);
    }
});

const jumboifyEmojis = definePostProcessor((tree, inline) => {
    if (inline) return jumboifyLine(tree);

    const [firstNode] = tree;
    if (!isParagraph(firstNode)) return;

    firstNode.content = jumboifyLine(firstNode.content);

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
});

const questsRegex = /^quests\/([0-9-]+)\/?$/;

const removeQuestLinks = definePostProcessor(tree => {
    const hasAllLinks = tree.every(isExternalLink);
    return tree.filter(
        node => !(isExternalLink(node) && matchQuestPath(node.target) && hasAllLinks)
    );

    function matchQuestPath(target: string): string | null {
        const url = parseUrl(target);

        const primaryHostRemainingPath = Object.values(Host)
            .map(getHostAndPath)
            .map(source => getRemainingPath(source, url))
            .find(Boolean);

        return primaryHostRemainingPath?.match(questsRegex)?.[1] ?? null;
    }
});

const toInlineText = definePostProcessor((tree, ...rest) => {
    tree.forEach(node => {
        if (!textNodeTypes.has(node.type) || !node.content) return;

        if (Array.isArray(node.content)) {
            toInlineText(node.content, ...rest);
        } else if (typeof node.content === "string") {
            node.content = node.content.replace(/\n/g, " ");
        }
    });
});

function hasSpoilerEmbeds(tree: ASTNode[], inline: boolean, message: FullMessage): boolean {
    if (message.embeds.length === 0) return false;

    if (inline) return hasSpoilerContent(tree);

    const [firstNode] = tree;
    return isParagraph(firstNode) && hasSpoilerContent(firstNode.content);

    function hasSpoilerContent(content: ASTNode[]): boolean {
        return treeWalker(content, item => {
            if (item.type !== ASTNodeType.SPOILER) return null;
            return treeWalker(item, node => isLink(node) || null);
        });
    }
}

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
