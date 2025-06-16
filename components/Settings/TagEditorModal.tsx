/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { parseUrl } from "@utils/misc";
import {
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalProps,
    ModalRoot,
    openModal,
} from "@utils/modal";
import {
    Alerts,
    Button,
    Checkbox,
    Flex,
    Forms,
    Text,
    TextInput,
    useCallback,
    useMemo,
    useState,
} from "@webpack/common";

import { cl } from "../..";
import { useTag } from "../../hooks";
import { settings } from "../../settings";
import { CustomTag } from "../../types";
import { diffObjects, Merger } from "../../utils";
import { Tag } from "../Tags";
import { ColorPicker } from "./ColorPicker";
import { IconTextInput } from "./IconTextInput";
import { InfoTooltip } from "./InfoTooltip";
import { TagRevertPreview } from "./TagRevertPreview";

interface TagEditorModalProps {
    modalProps: ModalProps;
    tag: CustomTag;
    modalKey: string;
    onSubmit?: (tag: CustomTag) => void;
}

export function TagEditorModal({
    modalProps,
    tag: originalTag,
    modalKey,
    onSubmit,
}: TagEditorModalProps) {
    const { tagOverrides } = settings.use(["tagOverrides"]);
    const [tag, setTag] = useState(() => ({ ...originalTag, ...tagOverrides[originalTag.id] }));

    const fullTag = useMemo(() => diffObjects(originalTag, tag, merger, true), [originalTag, tag]);

    // default svg icons are always monochromatic
    const isReactIcon = typeof fullTag.icon === "object" && !!fullTag.icon;

    const update = useCallback((t: Partial<CustomTag>) => setTag(prev => ({ ...prev, ...t })), []);

    const handleSubmit = useCallback(() => {
        onSubmit?.(tag);
        modalProps.onClose();
    }, [modalProps, tag, onSubmit]);

    const deleteTag = useCallback(
        () =>
            Alerts.show({
                title: "Do you really want to remove this tag override?",
                body: <TagRevertPreview tag={fullTag} revertedTag={originalTag} />,
                confirmText: "Yes",
                cancelText: "No",
                onConfirm: () => {
                    if (fullTag.custom) {
                        settings.store.tagOverrides[fullTag.id] = { disabled: fullTag.disabled };
                    } else {
                        delete settings.store.tagOverrides[fullTag.id];
                    }
                    modalProps.onClose();
                },
            }),
        [originalTag, fullTag]
    );

    return (
        <ModalRoot {...modalProps}>
            <ModalHeader separator={false}>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>
                    Edit tag
                </Text>
                <ModalCloseButton onClick={modalProps.onClose} />
            </ModalHeader>

            <ModalContent className={cl("vc-better-forums-modal-content", Margins.bottom8)}>
                <Forms.FormSection className="vc-better-forums-tag-preview">
                    <Tag tag={fullTag} />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Forms.FormTitle tag="h5">Name</Forms.FormTitle>
                    <TextInput
                        value={tag.name}
                        onChange={name => update({ name })}
                        placeholder={originalTag.name}
                    />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Forms.FormTitle tag="h5">Color</Forms.FormTitle>
                    <ColorPicker
                        color={tag.color ?? null}
                        onChange={color => update({ color })}
                        inverted={tag.invertedColor}
                    />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Checkbox
                        value={!!tag.invertedColor}
                        onChange={() => update({ invertedColor: !tag.invertedColor })}
                        reverse
                    >
                        <Forms.FormTitle tag="h5">Invert colors</Forms.FormTitle>
                    </Checkbox>
                </Forms.FormSection>
                <Forms.FormSection>
                    <Forms.FormTitle tag="h5">Icon</Forms.FormTitle>
                    <IconTextInput onChange={update} modalKey={modalKey} {...fullTag} />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Checkbox
                        value={(isReactIcon || tag.monochromeIcon) ?? false}
                        disabled={isReactIcon}
                        onChange={() => update({ monochromeIcon: !tag.monochromeIcon })}
                        reverse
                    >
                        <Forms.FormTitle tag="h5">
                            <div className="vc-better-forums-settings-row">
                                <span>Use monochrome icon</span>
                                <InfoTooltip text="Removes icon colors for better contrast" />
                            </div>
                        </Forms.FormTitle>
                    </Checkbox>
                </Forms.FormSection>
            </ModalContent>

            <ModalFooter
                justify={Flex.Justify.BETWEEN}
                direction={Flex.Direction.HORIZONTAL_REVERSE}
            >
                <Flex className="vc-better-forums-settings-row" grow={0}>
                    <Button
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.SMALL}
                        onClick={() => modalProps.onClose()}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} size={Button.Sizes.SMALL}>
                        Save
                    </Button>
                </Flex>
                {fullTag.id in tagOverrides && (
                    <Button
                        color={Button.Colors.RED}
                        look={Button.Looks.LINK}
                        size={Button.Sizes.SMALL}
                        onClick={deleteTag}
                    >
                        Remove
                    </Button>
                )}
            </ModalFooter>
        </ModalRoot>
    );
}

const merger: Merger<CustomTag> = {
    name: (p1, p2) => !!p2?.trim() && p1?.trim().toLowerCase() !== p2.trim().toLowerCase(),
    color: (p1, p2) => !!p1 !== !!p2 || p1 !== p2,
    invertedColor: (p1, p2) => !!p1 !== !!p2,
    monochromeIcon: (p1, p2) => !!p1 !== !!p2,
    emojiName: (p1, p2) => !!p2 && p1 !== p2,
    emojiId: (p1, p2) => !!p2 && p1 !== p2,
    icon: (oldIcon, newIcon, [, newObj]) => {
        const oldUrl = (typeof oldIcon === "string" && oldIcon.trim()) || null;
        const newUrl = (typeof newIcon === "string" && newIcon.trim()) || null;

        // an emoji is already used for an icon, null will replace original icon
        if (!newUrl && (newObj.emojiId || newObj.emojiName)) return true;

        // no invalid urls!
        if (!newUrl || !parseUrl(newUrl)) return false;

        return oldUrl !== newUrl;
    },
};

TagEditorModal.use = (tagId: CustomTag["id"]) => {
    const modalKey = `tag_editor_modal_${tagId}`;
    const tag = useTag(tagId);

    const handleSubmit = useCallback(
        (t: CustomTag) => {
            if (!tag) return;
            settings.store.tagOverrides[tagId] = diffObjects(tag, t, merger);
        },
        [tagId, tag]
    );

    return useCallback(() => {
        if (!tag)
            return Alerts.show({
                title: "Unknown tag",
                body: `The tag ${tagId} was not found in the cache.\nConsider switching accounts or removing this tag override.`,
            });

        openModal(
            props => (
                <TagEditorModal
                    modalProps={props}
                    tag={tag}
                    modalKey={modalKey}
                    onSubmit={handleSubmit}
                />
            ),
            { modalKey }
        );
    }, [tagId, modalKey, tag, handleSubmit]);
};
