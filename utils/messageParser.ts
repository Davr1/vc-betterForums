/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Parser } from "@webpack/common";
import { ReactNode } from "react";

import {
    ASTNode,
    ASTNodeType,
    EmojiASTNode,
    FullMessage,
    MessageParserOptions,
    MessagePostProcessor,
    ParseFn,
    ParserOptions,
} from "../types";
import {
    isEmoji,
    isExternalLink,
    isLink,
    isParagraph,
    isSimpleEmbedMedia,
    matchesDiscordPath,
    pipe,
    replaceKeywords,
    treeWalker,
} from "./";

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
        allowLinks: isWebhook || !!options.allowLinks,
        allowEmojiLinks: isWebhook,
        mentionChannels: message.mentionChannels,
        soundboardSounds: message.soundboardSounds ?? [],
    };
}

const definePostProcessor = (fn: MessagePostProcessor) => fn;

const removeSimpleEmbeds = definePostProcessor((tree, _, { embeds }) => {
    if (tree.length !== 1 || embeds.length !== 1) return;

    const [firstNode] = tree;
    if (!isLink(firstNode)) return;

    const [firstEmbed] = embeds;
    if (isSimpleEmbedMedia(firstEmbed)) return []; // empty tree
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
        node =>
            !(isExternalLink(node) && matchesDiscordPath(node.target, questsRegex) && hasAllLinks)
    );
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
    options: MessageParserOptions = {}
): { hasSpoilerEmbeds: boolean; content: ReactNode } {
    if (!message) return { hasSpoilerEmbeds: false, content: null };

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
                formatInline ? toInlineText : jumboifyEmojis,
                removeQuestLinks,
                postProcessor
            );
        }
    );

    return { hasSpoilerEmbeds: spoilerEmbeds, content: parsedContent };
}
