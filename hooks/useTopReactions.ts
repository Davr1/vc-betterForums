/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";
import { Message } from "discord-types/general";

import { MessageReactionWithBurst, ReactionType } from "../types";

export function useTopReactions(
    message: Message,
    limit?: number
): { id: string; type: ReactionType; count: number; reaction: MessageReactionWithBurst }[] {
    const reactions = message.reactions as MessageReactionWithBurst[];

    return useMemo(() => {
        return reactions
            .map(reaction => ({
                id: `${reaction.emoji.id ?? 0}:${reaction.emoji.name}`,
                reaction,
                ...(reaction.burst_count > reaction.count
                    ? { type: ReactionType.BURST, count: reaction.burst_count }
                    : { type: ReactionType.NORMAL, count: reaction.count }),
            }))
            .sort((r1, r2) => r2.count - r1.count)
            .slice(0, limit);
    }, [reactions, limit]);
}
