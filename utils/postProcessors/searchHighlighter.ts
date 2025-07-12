/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ASTNode, ASTNodeType, MessagePostProcessor } from "../../types";
import { normalizeWord } from "../text";
import { definePostProcessor } from "./";

class HighlightBuilder {
    private readonly nodes: ASTNode[] = [];
    public addWord(text: string, type: ASTNodeType) {
        const lastNode = this.nodes.at(-1);

        if (lastNode?.type === type) {
            lastNode.content += text;
        } else {
            this.nodes.push({ type, content: text });
        }
    }
    public build(): ASTNode[] {
        return this.nodes;
    }
}

function postProcesor(tree: ASTNode | ASTNode[], words: Set<string>): void {
    // array
    if (Array.isArray(tree)) return tree.forEach(node => postProcesor(node, words));

    // single node
    if (tree.content && typeof tree.content !== "string") return postProcesor(tree.content, words);

    // unformattable/preformated text
    if (typeof tree.content !== "string" || tree.type === ASTNodeType.CODE_BLOCK) return;

    const nodes = tree.content
        .split(/(\W+)/g)
        .reduce((acc, word) => {
            const normalized = normalizeWord(word);
            const highlighted = !!normalized && words.has(normalized);
            acc.addWord(word, highlighted ? ASTNodeType.HIGHLIGHT : ASTNodeType.TEXT);

            return acc;
        }, new HighlightBuilder())
        .build();

    // nothing was highlighted
    if (nodes.every(node => node.type !== ASTNodeType.HIGHLIGHT)) return;

    tree.content =
        tree.type === ASTNodeType.TEXT ? nodes : [{ type: ASTNodeType.TEXT, content: nodes }];
}

export function getSearchHighlighter(text: string): MessagePostProcessor {
    const words = new Set(text.split(/\W+/).values().map(normalizeWord).filter(Boolean));

    return definePostProcessor(tree => (words.size === 0 ? tree : postProcesor(tree, words)));
}
