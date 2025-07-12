/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { isExternalLink, matchesDiscordPath } from "..";
import { definePostProcessor } from "./";

const questsRegex = /^quests\/([0-9-]+)\/?$/;

export const removeQuestLinks = definePostProcessor(tree => {
    if (!tree.every(isExternalLink)) return;

    return tree.filter(
        node => !(isExternalLink(node) && matchesDiscordPath(node.target, questsRegex))
    );
});
