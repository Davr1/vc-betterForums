/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ASTNode, ASTNodeType, MessagePostProcessor } from "../../types";
import { isList } from "../ast";
import { InlineNodeBuilder, normalizeWord } from "../text";
import { definePostProcessor } from "./";

function matches(text: string, words: Set<string>, partial: boolean = false): boolean {
    const word = normalizeWord(text);
    if (!word) return false;
    if (words.has(word)) return true;
    return partial && word.length >= 3 && words.values().some(sub => word.includes(sub));
}

function postProcesor(tree: ASTNode | ASTNode[], words: Set<string>, partial: boolean): void {
    // array
    if (Array.isArray(tree)) return tree.forEach(node => postProcesor(node, words, partial));

    // markdown list
    if (isList(tree)) return tree.items.forEach(node => postProcesor(node, words, partial));

    // single node
    if (tree.content && typeof tree.content !== "string")
        return postProcesor(tree.content, words, partial);

    // unformattable/preformated text
    if (typeof tree.content !== "string" || tree.type === ASTNodeType.CODE_BLOCK) return;

    const nodes = tree.content
        .split(/(\W+)/g)
        .reduce((acc, word) => {
            const type = matches(word, words, partial) ? ASTNodeType.HIGHLIGHT : ASTNodeType.TEXT;
            acc.addWord(word, type);

            return acc;
        }, new InlineNodeBuilder())
        .build();

    // nothing was highlighted
    if (nodes.every(node => node.type !== ASTNodeType.HIGHLIGHT)) return;

    tree.content =
        tree.type === ASTNodeType.TEXT ? nodes : [{ type: ASTNodeType.TEXT, content: nodes }];
}

export function getSearchHighlighter(text: string, partial: boolean = false): MessagePostProcessor {
    const words = new Set(text.split(/\W+/).values().map(normalizeWord).filter(Boolean));

    return definePostProcessor(tree => (!words.size ? tree : postProcesor(tree, words, partial)));
}
