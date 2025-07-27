/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Alerts, lodash, useCallback, useMemo } from "@webpack/common";

import { useAllForumTags } from "../../hooks";
import { settings } from "../../settings";
import { CustomTag } from "../../types";

export function useTagActions(onUpdate?: () => void) {
    const forumTags = useAllForumTags();

    const { tagOverrides } = settings.use(["tagOverrides"]);

    const updateTag = useCallback(
        (
            id: CustomTag["id"],
            tag: null | Partial<CustomTag> | ((prev: Partial<CustomTag>) => Partial<CustomTag>)
        ) => {
            if (!tag) {
                delete tagOverrides[id];
            } else {
                tagOverrides[id] = typeof tag === "function" ? tag(tagOverrides[id] ?? {}) : tag;
            }

            onUpdate?.();
        },
        [tagOverrides, onUpdate]
    );

    return useMemo(
        () =>
            ({
                createTag: (id: CustomTag["id"]) => {
                    if (id in tagOverrides)
                        return Alerts.show({
                            title: "Tag override already exists",
                            body: "Please choose a different id",
                        });

                    if (!forumTags.has(id))
                        return Alerts.show({
                            title: "Forum tag doesn't exist",
                            body: "Did you copy the wrong id?",
                        });

                    updateTag(id, {});
                },
                toggleTag: (id: CustomTag["id"]) => {
                    updateTag(id, prev => ({ ...prev, disabled: !prev.disabled }));
                },
                resetTag: (id: CustomTag["id"]) => {
                    updateTag(id, lodash.pick(tagOverrides[id], "disabled"));
                },
                deleteTag: (id: CustomTag["id"]) => {
                    updateTag(id, null);
                },
                updateTag,
            } as const),
        [forumTags, tagOverrides, updateTag]
    );
}
