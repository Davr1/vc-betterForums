/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getUserSettingLazy } from "@api/UserSettings";
import { useMemo } from "@webpack/common";

import { Attachment, FullMessage } from "../../types";
import { getAttachments, getComponentMedia, getEmbeds } from "../../utils";

const inlineAttachmentMedia = getUserSettingLazy<boolean>("textAndImages", "inlineAttachmentMedia");
const inlineEmbedMedia = getUserSettingLazy<boolean>("textAndImages", "inlineEmbedMedia");
const renderEmbeds = getUserSettingLazy<boolean>("textAndImages", "renderEmbeds");

export function useMessageMedia(
    message: FullMessage | null,
    spoiler: boolean = false
): Attachment[] {
    const visibleAttachmentMedia = !!inlineAttachmentMedia?.useSetting();
    const visibleEmbedMedia = !!inlineEmbedMedia?.useSetting();
    const visibleEmbeds = !!renderEmbeds?.useSetting();

    const { attachments, embeds, components } = message ?? {};

    const attachmentMedia = useMemo(
        () => (visibleAttachmentMedia && attachments ? getAttachments(attachments) : []),
        [attachments, visibleAttachmentMedia]
    );
    const embedMedia = useMemo(
        () => (visibleEmbedMedia && visibleEmbeds && embeds ? getEmbeds(embeds, spoiler) : []),
        [embeds, visibleEmbedMedia, visibleEmbeds]
    );
    const componentMedia = useMemo(
        () => (visibleEmbedMedia && components ? getComponentMedia(components) : []),
        [components, visibleEmbedMedia]
    );

    return useMemo(
        () => [...attachmentMedia, ...embedMedia, ...componentMedia],
        [attachmentMedia, embedMedia, componentMedia]
    );
}
