/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    Alerts,
    Button,
    Checkbox,
    Flex,
    Parser,
    Text,
    useCallback,
    useMemo,
} from "@webpack/common";

import { cl } from "../..";
import { settings } from "../../settings";
import { CustomTag } from "../../types";
import { _memo, closeAllScreens } from "../../utils";
import { Icons } from "../icons";
import { TagEditorModal } from "../Modals/TagEditorModal";
import { Tag } from "../Tags";
import { InfoTooltip } from "./InfoTooltip";
import { TagRevertPreview } from "./TagRevertPreview";

export interface TagListItemProps {
    tag: Partial<CustomTag> & Pick<CustomTag, "id">;
    onToggle?: (id: CustomTag["id"]) => void;
    onReset?: (id: CustomTag["id"]) => void;
    onDelete?: (id: CustomTag["id"]) => void;
    onUpdate?: (id: CustomTag["id"], tag: Partial<CustomTag> | null) => void;
}

export const TagListItem = _memo<TagListItemProps>(function TagItem({
    tag,
    onToggle,
    onReset,
    onDelete,
    onUpdate,
}) {
    const { tagOverrides } = settings.use(["tagOverrides"]);
    const fullTag = useMemo(() => ({ ...tag, ...tagOverrides[tag.id] }), [tag, tagOverrides]);
    const unavailable = fullTag.disabled || (!fullTag.custom && !fullTag.channelId);

    const handleToggle = useCallback(() => onToggle?.(fullTag.id), [onToggle, fullTag.id]);
    const handleReset = useCallback(() => onReset?.(fullTag.id), [onReset, fullTag.id]);
    const handleDelete = useCallback(
        () =>
            Alerts.show({
                title: "Do you really want to remove this tag override?",
                body: <TagRevertPreview tag={fullTag} revertedTag={tag} />,
                confirmText: "Yes",
                cancelText: "No",
                onConfirm: () => onDelete?.(fullTag.id),
            }),
        [tag, fullTag, onDelete]
    );

    const openEditor = TagEditorModal.use(tag.id, onUpdate);

    return (
        <div className={cl("vc-better-forums-tag-setting", "vc-better-forums-settings-row")}>
            <Flex
                className={cl("vc-better-forums-settings-row", "vc-better-forums-tag-info")}
                justify={Flex.Justify.START}
                align={Flex.Align.CENTER}
            >
                {tag.custom && (
                    <Checkbox value={!fullTag.disabled} onChange={handleToggle} size={20} />
                )}
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
                        onClick={handleReset}
                    >
                        Reset
                    </Button>
                ) : (
                    <Button
                        color={Button.Colors.RED}
                        look={Button.Looks.LINK}
                        size={Button.Sizes.SMALL}
                        onClick={handleDelete}
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
