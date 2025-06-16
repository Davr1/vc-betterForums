/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import {
    Alerts,
    Button,
    Checkbox,
    Flex,
    Forms,
    Parser,
    Text,
    TextInput,
    useCallback,
    useMemo,
    useState,
} from "@webpack/common";

import { cl } from "../..";
import { useAllCustomTags, useAllForumTags } from "../../hooks";
import { settings } from "../../settings";
import { CustomTag } from "../../types";
import { _memo, closeAllScreens } from "../../utils";
import { Icons } from "../icons";
import { Tag } from "../Tags";
import { InfoTooltip } from "./InfoTooltip";
import { TagEditorModal } from "./TagEditorModal";
import { TagRevertPreview } from "./TagRevertPreview";

interface TagItemProps {
    tag: Partial<CustomTag> & Pick<CustomTag, "id">;
}

const TagItem = _memo<TagItemProps>(function TagItem({ tag }) {
    const { tagOverrides } = settings.use(["tagOverrides"]);
    const fullTag = useMemo(() => ({ ...tag, ...tagOverrides[tag.id] }), [tag, tagOverrides]);
    const unavailable = fullTag.disabled || (!fullTag.custom && !fullTag.channelId);

    const toggle = useCallback(() => {
        settings.store.tagOverrides[tag.id] ??= {};
        settings.store.tagOverrides[tag.id].disabled = !fullTag.disabled;
    }, [fullTag.disabled]);

    const reset = useCallback(() => {
        settings.store.tagOverrides[tag.id] = { disabled: fullTag.disabled };
    }, [fullTag.disabled]);

    const deleteTag = useCallback(
        () =>
            Alerts.show({
                title: "Do you really want to remove this tag override?",
                body: <TagRevertPreview tag={fullTag} revertedTag={tag} />,
                confirmText: "Yes",
                cancelText: "No",
                onConfirm: () => {
                    delete settings.store.tagOverrides[fullTag.id];
                },
            }),
        [tag, fullTag]
    );

    const openEditor = TagEditorModal.use(tag.id);

    return (
        <div className={cl("vc-better-forums-tag-setting", "vc-better-forums-settings-row")}>
            <Flex
                className={cl("vc-better-forums-settings-row", "vc-better-forums-tag-info")}
                justify={Flex.Justify.START}
                align={Flex.Align.CENTER}
            >
                {tag.custom && <Checkbox value={!fullTag.disabled} onChange={toggle} size={20} />}
                <Tag
                    tag={fullTag}
                    className={cl({ "vc-better-forums-tag-disabled": unavailable })}
                />
                <InfoTooltip
                    text={tag.info}
                    className={cl({ "vc-better-forums-tag-disabled": unavailable })}
                />
                {tag.channelId && (
                    <Text
                        variant="text-sm/normal"
                        className="vc-better-forums-channel-mention"
                        onClick={closeAllScreens}
                    >
                        {Parser.parse(`<#${tag.channelId}>`)}
                    </Text>
                )}
            </Flex>
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
                        Remove
                    </Button>
                )}
                <Button
                    innerClassName="vc-better-forums-button"
                    size={Button.Sizes.SMALL}
                    onClick={openEditor}
                >
                    <Icons.Pencil />
                    Edit
                </Button>
            </Flex>
        </div>
    );
});

export function TagSection() {
    const customTags = useAllCustomTags();
    const forumTags = useAllForumTags();

    const { tagOverrides } = settings.use(["tagOverrides"]);
    const overridenTags = useMemo(
        () =>
            Object.keys(tagOverrides)
                .filter(id => !customTags.has(id))
                .map(id => ({ ...forumTags.get(id), id })),
        [tagOverrides, forumTags]
    );

    const [newTagId, setNewTagId] = useState("");
    const createTagOverride = useCallback(() => {
        const id = newTagId.trim();
        if (id in settings.store.tagOverrides)
            return Alerts.show({
                title: "Tag override already exists",
                body: "Please choose a different id",
            });

        if (!forumTags.has(id))
            return Alerts.show({
                title: "Forum tag doesn't exist",
                body: "Did you copy the wrong id?",
            });

        settings.store.tagOverrides[id] = {};
        setNewTagId("");
    }, [newTagId]);

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
                {overridenTags.length > 0 && (
                    <Flex
                        direction={Flex.Direction.VERTICAL}
                        className="vc-better-forums-settings-stack"
                    >
                        {overridenTags.map(tag => (
                            <TagSection.Item tag={tag} key={tag.id} />
                        ))}
                    </Flex>
                )}
            </Forms.FormSection>
            <Forms.FormSection className="vc-better-forums-settings-row">
                <TextInput
                    value={newTagId}
                    onChange={setNewTagId}
                    placeholder="Tag ID"
                    className="vc-better-forums-number-input"
                    type="number"
                    pattern="\d{17,19}"
                />
                <Button onClick={createTagOverride} disabled={!newTagId.trim()}>
                    Create override
                </Button>
            </Forms.FormSection>
        </>
    );
}

TagSection.Item = TagItem;
