/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";

import { CustomTag } from "../types";
import { useAllCustomTags } from "./useAllCustomTags";
import { useAllForumTags } from "./useAllForumTags";

const unknownTag: CustomTag = { id: "unknown", name: "Unknown tag", custom: true };

export function useTag(tagId: CustomTag["id"]): CustomTag {
    const allForumTags = useAllForumTags();
    const allCustomTags = useAllCustomTags();

    return useMemo(
        () => allCustomTags.get(tagId) ?? allForumTags.get(tagId) ?? unknownTag,
        [allCustomTags, allForumTags, tagId]
    );
}
