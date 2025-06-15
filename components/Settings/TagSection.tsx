/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { Button, Checkbox, Flex, Forms, useCallback, useMemo } from "@webpack/common";

import { cl } from "../..";
import { useAllForumTags } from "../../hooks";
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

    const deleteTag = useCallback(() => {
        delete settings.store.tagOverrides[tag.id];
    }, []);

    const openEditor = TagEditorModal.use(tag.id);

    return (
        <div className={cl("vc-better-forums-tag-setting", "vc-better-forums-settings-row")}>
            {tag.custom && <Checkbox value={!fullTag.disabled} onChange={toggle} size={20} />}
            <Tag
                tag={fullTag}
                className={cl({ "vc-better-forums-tag-disabled": fullTag.disabled })}
                onClick={toggle}
            />
            <InfoTooltip
                text={tag.info}
                className={cl({ "vc-better-forums-tag-disabled": fullTag.disabled })}
            />
            <Flex justify={Flex.Justify.END}>
                {tag.custom ? (
                    <Button
                        color={Button.Colors.TRANSPARENT}
                        look={Button.Looks.LINK}
                        size={Button.Sizes.SMALL}
                        onClick={reset}
                    >
                        Reset
                    </Button>
                ) : (
                    <Button
                        color={Button.Colors.RED}
                        look={Button.Looks.LINK}
                        size={Button.Sizes.SMALL}
                        onClick={deleteTag}
                    >
                        Delete
                    </Button>
                )}
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
    const forumTags = useAllForumTags();

    const { tagOverrides } = settings.use(["tagOverrides"]);
    const overridenTags = useMemo(
        () =>
            Object.keys(tagOverrides)
                .map(id => forumTags.get(id))
                .filter(Boolean) as CustomTag[],
        [tagOverrides, forumTags]
    );

    return (
        <>
            <Forms.FormSection>
                <Forms.FormTitle tag="h3">Custom tags</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                    Custom tags provided by the plugin
                </Forms.FormText>
                <Flex
                    direction={Flex.Direction.VERTICAL}
                    className="vc-better-forums-settings-stack"
                >
                    {customTags.values().map(tag => (
                        <TagSection.Item tag={tag} key={tag.id} />
                    ))}
                </Flex>
            </Forms.FormSection>
            <Forms.FormSection>
                <Forms.FormTitle tag="h3">Forum tag overrides</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                    Tags from individual discord forums
                </Forms.FormText>
                <Flex
                    direction={Flex.Direction.VERTICAL}
                    className="vc-better-forums-settings-stack"
                >
                    {overridenTags.map(tag => (
                        <TagSection.Item tag={tag} key={tag.id} />
                    ))}
                </Flex>
            </Forms.FormSection>
        </>
    );
}

TagSection.Item = TagItem;
