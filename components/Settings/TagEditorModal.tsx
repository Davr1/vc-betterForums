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
import { Button, Checkbox, Flex, Forms, Text, TextInput, useState } from "@webpack/common";

import { cl } from "../..";
import { useTag } from "../../hooks";
import { CustomTag, CustomTagColor } from "../../types";
import { Tag } from "../Tags";
import { ColorPicker } from "./ColorPicker";

interface TagEditorModalProps {
    modalProps: ModalProps;
    tagId: CustomTag["id"];
}

export function TagEditorModal({ modalProps, tagId }: TagEditorModalProps) {
    const tag = useTag(tagId);

    const [name, setName] = useState<CustomTag["name"]>("");
    const [color, setColor] = useState<CustomTagColor | null>(tag?.color ?? null);
    const [invertedColor, setInvertedColor] = useState<boolean>(tag?.invertedColor ?? false);
    const [monochromeIcon, setMonochromeIcon] = useState<boolean>(tag?.monochromeIcon ?? false);

    if (!tag) return void modalProps.onClose();

    // default svg icons are always monochrome
    const isReactIcon = !!tag.icon && typeof tag.icon !== "string";

    const editedTag: CustomTag = {
        ...tag,
        name: name || tag.name,
        color,
        monochromeIcon: isReactIcon || monochromeIcon,
        invertedColor,
    };

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
                    <Tag tag={editedTag} />
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
                    <Checkbox
                        value={invertedColor}
                        onChange={() => setInvertedColor(value => !value)}
                        reverse
                    >
                        Invert colors
                    </Checkbox>
                </Forms.FormSection>
                <Forms.FormSection>
                    <Checkbox
                        value={isReactIcon || monochromeIcon}
                        disabled={isReactIcon}
                        onChange={() => setMonochromeIcon(value => !value)}
                        reverse
                    >
                        Use monochrome icon
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
                <Button onClick={() => modalProps.onClose()} size={Button.Sizes.SMALL}>
                    Save
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

TagEditorModal.open = (tagId: CustomTag["id"]) => {
    openModal(props => <TagEditorModal modalProps={props} tagId={tagId} />);
};
