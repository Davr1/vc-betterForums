/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { Flex, Forms } from "@webpack/common";

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
        <Forms.FormSection>
            <Forms.FormTitle tag="h3">{title}</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                {description}
            </Forms.FormText>
            {tags.length > 0 && (
                <Flex
                    direction={Flex.Direction.VERTICAL}
                    className="vc-better-forums-settings-stack"
                >
                    {tags.map(tag => (
                        <TagListItem tag={tag} key={tag.id} {...props} />
                    ))}
                </Flex>
            )}
        </Forms.FormSection>
    );
});
