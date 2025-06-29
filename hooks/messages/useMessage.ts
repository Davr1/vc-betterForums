/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { lodash, useMemo } from "@webpack/common";

import { UserSettingsProtoStore } from "../../stores";
import { ForumPostMetadata, FullMessage, MessageParserOptions } from "../../types";
import { unfurlAttachment } from "../../utils";
import { useMessageMedia } from "../index";

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

export function useMessage({
    message,
    formatInline = true,
    noStyleAndInteraction = true,
}: MessageParserOptions): ForumPostMetadata {
    const keywordFilterSettings = UserSettingsProtoStore.use(
        $ =>
            $.settings.textAndImages?.keywordFilterSettings ?? {
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
            message?.content
                ? parseMessageContent(message, {
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
        [message, formatInline, noStyleAndInteraction, shouldFilterKeywords]
    );

    const media = useMessageMedia(message, hasSpoilerEmbeds);
    const unfurledMedia = useMemo(
        () => media.map(item => unfurlAttachment(item, message)),
        [message, media]
    );

    return { content, media: unfurledMedia, hasSpoilerEmbeds };
}
