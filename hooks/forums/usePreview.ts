/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";

import { settings, ShowReplyPreview } from "../../settings";
import { ForumPostState } from "../../types";

function canShowTypingIndicator(forumState: ForumPostState, showReplyPreview: ShowReplyPreview) {
    if (forumState.isMuted) return false;

    switch (showReplyPreview) {
        case ShowReplyPreview.ALWAYS:
        case ShowReplyPreview.UNREADS_ONLY:
            return true;
        case ShowReplyPreview.FOLLOWED_ONLY:
            return forumState.hasJoined;
        default:
            return false;
    }
}

function canShowReplyPreview(forumState: ForumPostState, showReplyPreview: ShowReplyPreview) {
    if (forumState.isMuted) return false;

    switch (showReplyPreview) {
        case ShowReplyPreview.ALWAYS:
            return true;
        case ShowReplyPreview.UNREADS_ONLY:
            return forumState.hasUnreads || forumState.isNew;
        case ShowReplyPreview.FOLLOWED_ONLY:
            return forumState.hasJoined;
        default:
            return false;
    }
}

export function usePreview(
    forumState: ForumPostState,
    hasRecentMessage: boolean,
    hasTypingUsers: boolean
): Record<`is${"ReplyPreview" | "TypingIndicator" | "Empty"}`, boolean> {
    const { showReplyPreview } = settings.use(["showReplyPreview"]);

    return useMemo(() => {
        const isReplyPreview =
            hasRecentMessage && canShowReplyPreview(forumState, showReplyPreview);
        const isTypingIndicator =
            hasTypingUsers && canShowTypingIndicator(forumState, showReplyPreview);

        const isEmpty = !isReplyPreview && !isTypingIndicator;

        return { isReplyPreview, isTypingIndicator, isEmpty };
    }, [forumState, showReplyPreview, hasRecentMessage, hasTypingUsers]);
}
