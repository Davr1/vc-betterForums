/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useForceUpdater } from "@utils/react";
import { lodash, Toasts, useCallback, useMemo } from "@webpack/common";

import { useAllCustomTags, useAllForumTags, useTagActions } from "../../hooks";
import { settings } from "../../settings";
import { TagOverrides } from "../../types";
import { BackupSection } from "./BackupSection";
import { NewOverrideSection } from "./NewOverrideSection";
import { TagListSection, TagListSectionProps } from "./TagListSection";
export { TagEditorModal } from "../Modals/TagEditorModal";

export function TagSections() {
    const [version, updateVersion] = useForceUpdater(true);
    const { createTag, deleteTag, updateTag, resetTag, toggleTag } = useTagActions(updateVersion);

    const customTags = useAllCustomTags(); // full plugin-defined tags (custom: true)
    const forumTags = useAllForumTags(); // full forum tags (custom?: false)
    const { tagOverrides } = settings.use(["tagOverrides"]); // all tag overrides

    // forum tag ids that have an override
    const forumTagsOverrides = useMemo(
        () => Object.keys(tagOverrides).filter(id => !customTags.has(id)),
        [tagOverrides, customTags]
    );

    // plugin-defined tags with overrides applied
    const overridenCustomTags = useMemo(() => customTags.values().toArray(), [customTags]);
    // forum tags with overrides applied
    const overridenForumTags = useMemo(
        () => forumTagsOverrides.map(id => ({ ...forumTags.get(id), id })),
        [forumTagsOverrides, forumTags]
    );

    // forum tag overrides only
    const tagsForExport = useMemo(
        () => lodash.pick(tagOverrides, ...forumTagsOverrides),
        [tagOverrides, forumTagsOverrides]
    );

    const handleLoad = useCallback(
        (data: TagOverrides | null) => {
            if (!data) return;

            for (const [id, value] of Object.entries(data)) {
                updateTag(id, value);
            }

            Toasts.show({
                message: `Successfully imported ${Object.keys(data).length} tags`,
                id: Toasts.genId(),
                type: Toasts.Type.SUCCESS,
            });

            updateVersion();
        },
        [updateTag]
    );

    const handleError = useCallback(
        (message: string) =>
            Toasts.show({
                message,
                id: Toasts.genId(),
                type: Toasts.Type.FAILURE,
            }),
        []
    );

    const listSectionProps = {
        onToggle: toggleTag,
        onDelete: deleteTag,
        onReset: resetTag,
        onUpdate: updateTag,
    } as const satisfies Partial<TagListSectionProps>;

    return (
        <>
            <TagListSection
                tags={overridenCustomTags}
                title="Custom tags"
                description="Custom tags provided by the plugin"
                {...listSectionProps}
            />
            <TagListSection
                tags={overridenForumTags}
                title="Forum tag overrides"
                description="Tags from individual discord forums"
                {...listSectionProps}
            />
            <NewOverrideSection onCreate={createTag} />
            <BackupSection
                tags={tagsForExport}
                onLoad={handleLoad}
                onError={handleError}
                key={version} // resets the component state when tagOverrides changes
            />
        </>
    );
}
