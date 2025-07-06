/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessagePostProcessor } from "../../types";

export { jumboifyEmojis } from "./jumboifyEmojis";
export { removeQuestLinks } from "./removeQuestLinks";
export { removeSimpleEmbeds } from "./removeSimpleEmbeds";
export { getSearchHighlighter } from "./searchHighlighter";
export { toInlineText } from "./toInlineText";

export function definePostProcessor(fn: MessagePostProcessor) {
    return fn;
}
