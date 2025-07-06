/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { lodash, useMemo } from "@webpack/common";

import { UserSettingsProtoStore } from "../../stores";
import { ForumPostMetadata, MessageFormatOptions } from "../../types";
import { parseInlineContent, unfurlAttachment } from "../../utils";
import { useMessageMedia } from "../index";

export function useMessage({
    message,
    formatInline = true,
    noStyleAndInteraction = true,
}: MessageFormatOptions): ForumPostMetadata {
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

    const { hasSpoilerEmbeds, content } = useMemo(() => {
        return parseInlineContent(message, {
            formatInline,
            noStyleAndInteraction,
            shouldFilterKeywords,
            allowHeading: true,
            allowList: true,
        });
    }, [message, formatInline, noStyleAndInteraction, shouldFilterKeywords]);

    const media = useMessageMedia(message, hasSpoilerEmbeds);
    const unfurledMedia = useMemo(
        () => media.map(item => unfurlAttachment(item, message)),
        [message, media]
    );

    return { content, media: unfurledMedia, hasSpoilerEmbeds };
}
