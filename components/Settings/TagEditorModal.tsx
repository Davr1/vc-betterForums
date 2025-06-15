/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
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
import { CustomTag, CustomTagColor } from "../../types";
import { Tag } from "../Tags";
import { ColorPicker } from "./ColorPicker";
import { IconTextInput } from "./IconTextInput";

interface TagEditorModalProps {
    modalProps: ModalProps;
    tagId: CustomTag["id"];
    modalKey: string;
    onSubmit?: (tag: Partial<CustomTag>) => void;
}

export function TagEditorModal({ modalProps, tagId, modalKey, onSubmit }: TagEditorModalProps) {
    const { tagOverrides } = settings.use(["tagOverrides"]);

    const tag = useTag(tagId);
    const fullTag = useMemo(() => ({ ...tag, ...tagOverrides[tag.id] }), [tag, tagOverrides]);

    const [name, setName] = useState<CustomTag["name"]>(
        fullTag.name === tag.name ? "" : fullTag.name || ""
    );
    const [color, setColor] = useState<CustomTagColor | null>(fullTag.color ?? null);
    const [invertedColor, setInvertedColor] = useState<boolean>(fullTag.invertedColor ?? false);
    const [monochromeIcon, setMonochromeIcon] = useState<boolean>(fullTag.monochromeIcon ?? false);
    const [icon, setIcon] = useState<Pick<CustomTag, "icon" | "emojiName" | "emojiId">>(fullTag);

    // default svg icons are always monochrome
    const isReactIcon = !!icon.icon && typeof icon.icon !== "string";

    const editedTag = useMemo(() => {
        const partialTag: Partial<CustomTag> = {};

        const newName = name.trim();
        const newIcon = (typeof icon.icon === "string" && icon.icon.trim()) || null;

        if (newName && tag.name.trim().toLowerCase() !== newName.toLowerCase()) {
            partialTag.name = newName;
        }
        if (tag.color !== color) {
            partialTag.color = color;
        }
        if (!!tag.invertedColor !== !!invertedColor) {
            partialTag.invertedColor = invertedColor;
        }
        if (!!tag.monochromeIcon !== !!monochromeIcon) {
            partialTag.monochromeIcon = monochromeIcon;
        }
        if ((newIcon || icon.emojiId || icon.emojiName) && tag.icon !== newIcon) {
            partialTag.icon = newIcon;
        }
        if (icon.emojiName && tag.emojiName !== icon.emojiName) {
            partialTag.emojiName = icon.emojiName;
        }
        if (icon.emojiId && tag.emojiId !== icon.emojiId) {
            partialTag.emojiId = icon.emojiId;
        }

        return partialTag;
    }, [tag, name, color, invertedColor, monochromeIcon, icon.icon, icon.emojiId, icon.emojiName]);

    const handleSubmit = useCallback(() => {
        onSubmit?.(editedTag);

        modalProps.onClose();
    }, [modalProps, editedTag, onSubmit]);

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
                    <Tag tag={{ ...tag, ...editedTag }} />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Forms.FormTitle tag="h5">Name</Forms.FormTitle>
                    <TextInput value={name} onChange={setName} placeholder={tag.name} />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Forms.FormTitle tag="h5">Color</Forms.FormTitle>
                    <ColorPicker color={color} onChange={setColor} inverted={invertedColor} />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Forms.FormTitle tag="h5">Icon</Forms.FormTitle>
                    <IconTextInput
                        defaultValue={
                            (typeof icon.icon === "string" && icon.icon) ||
                            (icon.emojiId
                                ? `<:${icon.emojiName}:${icon.emojiId}>`
                                : icon.emojiName) ||
                            ""
                        }
                        onChange={setIcon}
                        modalKey={modalKey}
                    />
                </Forms.FormSection>
                <Forms.FormSection>
                    <Checkbox
                        value={invertedColor}
                        onChange={() => setInvertedColor(value => !value)}
                        reverse
                    >
                        <Forms.FormTitle tag="h5">Invert colors</Forms.FormTitle>
                    </Checkbox>
                </Forms.FormSection>
                <Forms.FormSection>
                    <Checkbox
                        value={isReactIcon || monochromeIcon}
                        disabled={isReactIcon}
                        onChange={() => setMonochromeIcon(value => !value)}
                        reverse
                    >
                        <Forms.FormTitle tag="h5">Use monochrome icon</Forms.FormTitle>
                    </Checkbox>
                </Forms.FormSection>
            </ModalContent>

            <ModalFooter justify={Flex.Justify.END} direction={Flex.Direction.HORIZONTAL}>
                <Button
                    color={Button.Colors.TRANSPARENT}
                    look={Button.Looks.LINK}
                    size={Button.Sizes.SMALL}
                    onClick={() => modalProps.onClose()}
                >
                    Cancel
                </Button>
                <Button onClick={handleSubmit} size={Button.Sizes.SMALL}>
                    Save
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

TagEditorModal.open = (tagId: CustomTag["id"], onSubmit?: (tag: Partial<CustomTag>) => void) => {
    const modalKey = `tag_editor_modal_${tagId}`;
    openModal(
        props => (
            <TagEditorModal
                modalProps={props}
                tagId={tagId}
                modalKey={modalKey}
                onSubmit={onSubmit}
            />
        ),
        {
            modalKey,
        }
    );
};
