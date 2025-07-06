/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    ASTNode,
    ASTNodeType,
    EmojiASTNode,
    LinkASTNode,
    ListASTNode,
    ParagraphASTNode,
} from "../types";

export function treeWalker(
    tree: ASTNode | ASTNode[],
    cb: (node: ASTNode) => boolean | null
): boolean {
    if (Array.isArray(tree)) {
        return tree.some(item => treeWalker(item, cb));
    }

    if (cb(tree)) return true;

    if (Array.isArray(tree.content)) {
        return treeWalker(tree.content, cb);
    }

    return isList(tree) && tree.items.some(item => treeWalker(item, cb));
}

export function isParagraph(node: ASTNode): node is ParagraphASTNode {
    return node.type === ASTNodeType.PARAGRAPH && Array.isArray(node.content);
}

export function isEmoji(node: ASTNode): node is EmojiASTNode {
    return (
        node.type === ASTNodeType.EMOJI ||
        node.type === ASTNodeType.CUSTOM_EMOJI ||
        node.type === ASTNodeType.SOUNDBOARD
    );
}

export function isLink(node: ASTNode) {
    return isExternalLink(node) || node.type === ASTNodeType.ATTACHMENT_LINK;
}

export function isExternalLink(node: ASTNode): node is LinkASTNode {
    return node.type === ASTNodeType.LINK;
}

export function isList(node: ASTNode): node is ListASTNode {
    return node.type === ASTNodeType.LIST && "items" in node && Array.isArray(node.items);
}
