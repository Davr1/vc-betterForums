/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SettingsSection } from "@components/settings/tabs/plugins/components/Common";

import { Flex } from "@components/Flex";
import { CustomTag } from "../../types";
import { _memo } from "../../utils";
import { TagListItem, TagListItemProps } from "./TagListItem";
export { TagEditorModal } from "../Modals/TagEditorModal";

export interface TagListSectionProps extends Omit<TagListItemProps, "tag"> {
    tags: CustomTag[];
    title: string;
    description?: string;
}

export const TagListSection = _memo<TagListSectionProps>(function TagListSection({
    tags,
    title,
    description,
    ...props
}) {
    return (
        <SettingsSection name={title} description={description ?? ""} error={null}>
            {tags.length > 0 && (
                <Flex flexDirection="column" gap="var(--space-xs)">
                    {tags.map(tag => (
                        <TagListItem tag={tag} key={tag.id} {...props} />
                    ))}
                </Flex>
            )}
        </SettingsSection>
    );
});
