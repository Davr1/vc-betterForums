/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";
import { ReactNode } from "react";

import { CustomTag } from "../types";
import { getEmojiURL } from "../utils";

export function useTagIcon(tag: CustomTag): string | ReactNode | null {
    return useMemo(() => {
        if (typeof tag.icon === "string")
            try {
                new URL(tag.icon);
                return tag.icon;
            } catch {}

        if (tag.icon) return tag.icon;

        return getEmojiURL({ id: tag.emojiId, name: tag.emojiName });
    }, [tag]);
}
