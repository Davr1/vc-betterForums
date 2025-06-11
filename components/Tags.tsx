/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text, Tooltip } from "@webpack/common";
import { ReactNode } from "react";

import { cl } from "..";
import { CustomTag, Tag as TagType } from "../types";
import { Emoji } from "./Emoji";

interface TagProps {
    tag: TagType;
    className?: string;
}

export function Tag({ tag, className }: TagProps) {
    if (tag.custom) return <CustomTag {...tag} />;

    const { emojiId, emojiName, name } = tag;

    return (
        <div className={cl(className, "vc-better-forums-tag")}>
            <Emoji
                emojiId={emojiId}
                emojiName={emojiName}
                size="reaction"
                animated={false}
                className="vc-better-forums-tag-emoji"
            />
            <Text variant="text-xs/bold" lineClamp={1} color="currentColor">
                {name}
            </Text>
        </div>
    );
}

interface MoreTagsProps {
    tags: TagType[];
    renderTag: (tag: TagType) => ReactNode;
}

export function MoreTags({ tags, renderTag }: MoreTagsProps) {
    return (
        <Tooltip
            text={tags.map(renderTag)}
            tooltipClassName="vc-better-forums-extra-tags-tooltip"
            tooltipContentClassName="vc-better-forums-extra-tags"
        >
            {props => (
                <div className="vc-better-forums-tag" {...props}>
                    <Text variant="text-xs/semibold" color="currentColor">
                        +{tags.length}
                    </Text>
                </div>
            )}
        </Tooltip>
    );
}

interface CustomTagProps extends CustomTag {
    className?: string;
}

export function CustomTag({ name, color = "blue", icon, className }: CustomTagProps) {
    return (
        <div className={cl(className, "vc-better-forums-tag-custom")} data-color={color}>
            {icon}
            <Text variant="text-xs/bold" lineClamp={1} color="currentColor">
                {name}
            </Text>
        </div>
    );
}
