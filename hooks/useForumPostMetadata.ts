/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { lodash, useMemo, useStateFromStores } from "@webpack/common";
import { ReactNode } from "react";

import { findByCodeLazy } from "../../../webpack";
import { UserSettingsProtoStore } from "../stores";
import { FullMessage, UnfurledMediaItem } from "../types";
import { unfurlAttachment } from "../utils";
import { useMessageMedia } from "./";

interface Options {
    firstMessage: FullMessage | null;
    formatInline?: boolean;
    noStyleAndInteraction?: boolean;
}

interface ForumPostMetadata {
    hasSpoilerEmbeds?: boolean;
    content: ReactNode;
    media: UnfurledMediaItem[];
}

const parseMessageContent: (
    message: FullMessage,
    options: Partial<
        Record<
            | "formatInline"
            | "noStyleAndInteraction"
            | "allowHeading"
            | "allowList"
            | "shouldFilterKeywords",
            boolean
        >
    >
) => Pick<ForumPostMetadata, "hasSpoilerEmbeds" | "content"> = findByCodeLazy(
    "hideSimpleEmbedContent",
    "escapeReplacement"
);

export function useForumPostMetadata({
    firstMessage,
    formatInline = true,
    noStyleAndInteraction = true,
}: Options): ForumPostMetadata {
    const keywordFilterSettings = useStateFromStores(
        [UserSettingsProtoStore],
        () =>
            UserSettingsProtoStore.settings.textAndImages?.keywordFilterSettings ?? {
                profanity: false,
                sexualContent: false,
                slurs: false,
            },
        [],
        lodash.isEqual
    );

    const shouldFilterKeywords = !!(
        keywordFilterSettings.profanity ||
        keywordFilterSettings.sexualContent ||
        keywordFilterSettings.slurs
    );

    const { hasSpoilerEmbeds, content } = useMemo(
        () =>
            firstMessage?.content
                ? parseMessageContent(firstMessage, {
                      formatInline,
                      noStyleAndInteraction,
                      shouldFilterKeywords,
                      allowHeading: true,
                      allowList: true,
                  })
                : {
                      hasSpoilerEmbeds: false,
                      content: null,
                  },
        [firstMessage, formatInline, noStyleAndInteraction, shouldFilterKeywords]
    );

    const media = useMessageMedia(firstMessage, hasSpoilerEmbeds);
    const unfurledMedia = useMemo(
        () => media.map(item => unfurlAttachment(item, firstMessage)),
        [firstMessage, media]
    );

    return { content, media: unfurledMedia, hasSpoilerEmbeds };
}
