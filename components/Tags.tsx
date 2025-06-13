/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text, Tooltip, useCallback } from "@webpack/common";
import { MouseEvent, ReactNode } from "react";

import { cl } from "..";
import { Tag as TagType } from "../types";
import { Emoji } from "./Emoji";

interface TagProps {
    tag: TagType;
    className?: string;
    onContextMenu?: (event: MouseEvent<HTMLDivElement>, tag: TagType) => void;
}

export function Tag({ tag, className, onContextMenu }: TagProps) {
    const handleContextMenu = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!onContextMenu) return;
            event.stopPropagation();
            onContextMenu(event, tag);
        },
        [tag, onContextMenu]
    );

    return (
        <div
            className={cl(className, "vc-better-forums-tag")}
            onContextMenu={handleContextMenu}
            data-color={tag.color}
        >
            {tag.custom ? (
                tag.icon
            ) : (
                <Emoji
                    emojiId={tag.emojiId}
                    emojiName={tag.emojiName}
                    size="reaction"
                    animated={false}
                    className="vc-better-forums-tag-emoji"
                />
            )}
            <Text variant="text-xs/bold" lineClamp={1} color="currentColor">
                {tag.name}
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
