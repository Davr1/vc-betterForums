/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { isLink, isSimpleEmbedMedia } from "..";
import { definePostProcessor } from "./";

export const removeSimpleEmbeds = definePostProcessor((tree, _, { embeds }) => {
    if (tree.length !== 1 || embeds?.length !== 1) return;

    const [firstNode] = tree;
    if (!isLink(firstNode)) return;

    const [firstEmbed] = embeds;
    if (isSimpleEmbedMedia(firstEmbed)) return []; // empty tree
});
