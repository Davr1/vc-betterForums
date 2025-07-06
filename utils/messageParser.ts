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
    FullMessage,
    MessageParserOptions,
    ParseFn,
    ParserOptions,
    PartiallyRequired,
} from "../types";
import { isLink, isParagraph, pipe, replaceKeywords, treeWalker } from "./";
import {
    jumboifyEmojis,
    removeQuestLinks,
    removeSimpleEmbeds,
    toInlineText,
} from "./postProcessors";

function getFullOptions(
    message: Partial<FullMessage>,
    options: Partial<ParserOptions>
): ParserOptions {
    const isWebhook = !!message.webhookId;

    return {
        channelId: message.channel_id,
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
        mentionChannels: message.mentionChannels ?? [],
        soundboardSounds: message.soundboardSounds ?? [],
    };
}

function hasSpoilerEmbeds(
    tree: ASTNode[],
    inline: boolean,
    message: Partial<FullMessage>
): boolean {
    if (!message.embeds || message.embeds.length === 0) return false;

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
    message?: PartiallyRequired<FullMessage, "content"> | null,
    options: MessageParserOptions = {}
): { hasSpoilerEmbeds: boolean; content: ReactNode } {
    const {
        hideSimpleEmbedContent = true,
        formatInline = true,
        postProcessor,
        shouldFilterKeywords,
        contentMessage,
    } = options;

    const fullMessage = contentMessage ?? message;
    if (!fullMessage) return { hasSpoilerEmbeds: false, content: null };

    const textContent = shouldFilterKeywords
        ? replaceKeywords(fullMessage.content, { escapeReplacement: true })
        : fullMessage.content;

    const parserFn: ParseFn = formatInline ? Parser.parseInlineReply : Parser.parse;

    let spoilerEmbeds = false;

    const parsedContent = parserFn(
        textContent,
        formatInline,
        getFullOptions(fullMessage, options),
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
