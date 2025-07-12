/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";

import { FullMessage, ReactionType, SortedReaction } from "../../types";

export function useSortedReactions({ reactions }: FullMessage): SortedReaction[] {
    return useMemo(() => {
        return reactions
            .map(reaction => ({
                id: `${reaction.emoji.id ?? 0}:${reaction.emoji.name}`,
                reaction,
                ...(reaction.burst_count > reaction.count
                    ? { type: ReactionType.BURST, count: reaction.burst_count }
                    : { type: ReactionType.NORMAL, count: reaction.count }),
            }))
            .sort((r1, r2) => r2.count - r1.count);
    }, [reactions]);
}
