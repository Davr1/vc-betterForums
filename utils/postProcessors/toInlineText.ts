/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ASTNodeType } from "../../types";
import { definePostProcessor } from "./";

const textNodeTypes = new Set([
    ASTNodeType.STRONG,
    ASTNodeType.ITALICS,
    ASTNodeType.UNDERLINE,
    ASTNodeType.TEXT,
    ASTNodeType.INLINE_CODE,
    ASTNodeType.STRIKETHROUGH,
    ASTNodeType.SPOILER,
]);

export const toInlineText = definePostProcessor((tree, ...rest) => {
    tree.forEach(node => {
        if (!textNodeTypes.has(node.type) || !node.content) return;

        if (Array.isArray(node.content)) {
            toInlineText(node.content, ...rest);
        } else if (typeof node.content === "string") {
            node.content = node.content.replace(/\n/g, " ");
        }
    });
});
