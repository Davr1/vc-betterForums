/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ASTNode, EmojiASTNode } from "../../types";
import { isEmoji, isParagraph } from "../index";
import { definePostProcessor } from "./";

export const jumboifyEmojis = definePostProcessor((tree, inline) => {
    if (inline) return jumboifyLine(tree);

    const [firstNode] = tree;
    if (!isParagraph(firstNode)) return;

    firstNode.content = jumboifyLine(firstNode.content);
});

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
