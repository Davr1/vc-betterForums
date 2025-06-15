/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { Button, Checkbox, Flex, Forms, useCallback, useMemo } from "@webpack/common";

import { cl } from "../..";
import { useAllCustomTags } from "../../hooks/useAllCustomTags";
import { settings } from "../../settings";
import { CustomTag } from "../../types";
import { Icons } from "../icons";
import { Tag } from "../Tags";
import { InfoTooltip } from "./InfoTooltip";
import { TagEditorModal } from "./TagEditorModal";

interface TagItemProps {
    tag: CustomTag;
}

function TagItem({ tag }: TagItemProps) {
    const { tagOverrides } = settings.use(["tagOverrides"]);
    const fullTag = useMemo(() => ({ ...tag, ...tagOverrides[tag.id] }), [tag, tagOverrides]);

    const toggle = useCallback(() => {
        settings.store.tagOverrides[tag.id] ??= {};
        settings.store.tagOverrides[tag.id].disabled = !fullTag.disabled;
    }, [fullTag.disabled]);

    const reset = useCallback(() => {
        settings.store.tagOverrides[tag.id] = { disabled: fullTag.disabled };
    }, [fullTag.disabled]);

    const openEditor = TagEditorModal.use(tag.id);

    return (
        <div className={cl("vc-better-forums-tag-setting", "vc-better-forums-settings-row")}>
            <Checkbox value={!fullTag.disabled} onChange={toggle} size={20} disabled={!tag.custom}>
                <Tag
                    tag={fullTag}
                    className={cl({ "vc-better-forums-tag-disabled": fullTag.disabled })}
                />
            </Checkbox>
            <InfoTooltip
                text={tag.info}
                className={cl({ "vc-better-forums-tag-disabled": fullTag.disabled })}
            />
            <Flex justify={Flex.Justify.END}>
                <Button
                    color={Button.Colors.TRANSPARENT}
                    look={Button.Looks.LINK}
                    size={Button.Sizes.SMALL}
                    onClick={reset}
                >
                    Reset
                </Button>
                <Button
                    innerClassName="vc-better-forums-button"
                    size={Button.Sizes.SMALL}
                    disabled={fullTag.disabled}
                    onClick={openEditor}
                >
                    <Icons.Pencil />
                    Edit
                </Button>
            </Flex>
        </div>
    );
}

export function TagSection() {
    const customTags = useAllCustomTags();

    return (
        <Forms.FormSection>
            <Forms.FormTitle tag="h3">Custom tags</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                Custom tags provided by the plugin
            </Forms.FormText>
            <Flex direction={Flex.Direction.VERTICAL} className="vc-better-forums-settings-stack">
                {customTags.values().map(tag => (
                    <TagSection.Item tag={tag} key={tag.id} />
                ))}
            </Flex>
        </Forms.FormSection>
    );
}

TagSection.Item = TagItem;
