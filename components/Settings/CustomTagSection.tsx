/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { Button, Checkbox, Flex, Forms, Tooltip, useCallback, useMemo } from "@webpack/common";

import { cl } from "../..";
import { useAllCustomTags } from "../../hooks/useAllCustomTags";
import { settings } from "../../settings";
import { CustomTag } from "../../types";
import { Icons } from "../icons";
import { Tag } from "../Tags";
import { TagEditorModal } from "./";

interface TagItemProps {
    tag: CustomTag;
}

function TagItem({ tag }: TagItemProps) {
    const { tagOverrides } = settings.use(["tagOverrides"]);
    const fullTag = useMemo(() => ({ ...tag, ...tagOverrides[tag.id] }), [tag, tagOverrides]);

    const handleChange = useCallback(
        (newTag: Partial<CustomTag>) => {
            settings.store.tagOverrides[tag.id] = newTag;
        },
        [tag.id]
    );

    const toggle = useCallback(() => {
        settings.store.tagOverrides[tag.id] ??= {};
        settings.store.tagOverrides[tag.id].disabled = !fullTag.disabled;
    }, [fullTag.disabled]);

    const edit = useCallback(
        () => TagEditorModal.open(tag.id, handleChange),
        [tag.id, handleChange]
    );

    return (
        <div className="vc-better-forums-tag-setting">
            <Checkbox value={!fullTag.disabled} onChange={toggle} size={20}>
                <Tag
                    tag={fullTag}
                    className={cl({ "vc-better-forums-tag-disabled": fullTag.disabled })}
                />
            </Checkbox>
            {tag.info && (
                <Tooltip text={tag.info}>
                    {props => (
                        <div className="vc-better-forums-icon-container" {...props}>
                            <Icons.Info size={20} />
                        </div>
                    )}
                </Tooltip>
            )}
            <Button
                innerClassName="vc-better-forums-button"
                size={Button.Sizes.SMALL}
                disabled={fullTag.disabled}
                onClick={edit}
            >
                <Icons.Pencil />
                Edit
            </Button>
        </div>
    );
}

export function CustomTagSection() {
    const customTags = useAllCustomTags();

    return (
        <Forms.FormSection>
            <Forms.FormTitle tag="h3">Custom tags</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                Custom tags provided by the plugin
            </Forms.FormText>
            <Flex direction={Flex.Direction.VERTICAL} className="vc-better-forums-tag-settings">
                {customTags.values().map(tag => (
                    <CustomTagSection.Item tag={tag} key={tag.id} />
                ))}
            </Flex>
        </Forms.FormSection>
    );
}

CustomTagSection.Item = TagItem;
