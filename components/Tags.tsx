/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import { Tooltip, useCallback } from "@webpack/common";
import { HTMLProps, MouseEvent, ReactNode } from "react";

import { cl } from "..";
import { useTagIcon } from "../hooks";
import { CustomTag } from "../types";
import { _memo, textClampStyle } from "../utils";

interface TagProps extends Omit<HTMLProps<HTMLDivElement>, "onContextMenu" | "onClick"> {
    tag: CustomTag;
    filtered?: boolean;
    onClick?: (event: MouseEvent<HTMLDivElement>, tag: CustomTag) => void;
    onContextMenu?: (event: MouseEvent<HTMLDivElement>, tag: CustomTag) => void;
}

export const Tag = _memo<TagProps>(function Tag({
    tag,
    className,
    onClick,
    onContextMenu,
    filtered,
    ...props
}) {
    const icon = useTagIcon(tag);

    const handleContextMenu = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!onContextMenu) return;
            event.stopPropagation();
            onContextMenu(event, tag);
        },
        [tag, onContextMenu]
    );

    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!onClick) return;
            event.stopPropagation();
            onClick(event, tag);
        },
        [tag, onClick]
    );

    return (
        <div
            className={cl(className, "vc-better-forums-tag", {
                "vc-better-forums-tag-filtered": filtered,
                "vc-better-forums-tag-clickable": !!onClick,
            })}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            data-color={tag.color}
            data-inverted-color={tag.invertedColor}
            {...props}
        >
            {typeof icon === "string" ? (
                tag.monochromeIcon ? (
                    <div
                        className="vc-better-forums-tag-icon-monochrome"
                        style={{ maskImage: `url('${icon}')` }}
                    />
                ) : (
                    <div
                        className="vc-better-forums-tag-icon"
                        style={{ backgroundImage: `url('${icon}')` }}
                    />
                )
            ) : (
                tag.icon
            )}
            <BaseText
                size="xs"
                weight="bold"
                style={{ color: "currentcolor", ...textClampStyle(1) }}
            >
                {tag.name ?? "Unknown tag"}
            </BaseText>
        </div>
    );
});

interface MoreTagsProps {
    tags: CustomTag[];
    renderTag: (tag: CustomTag) => ReactNode;
}

export const MoreTags = _memo<MoreTagsProps>(function MoreTags({ tags, renderTag }) {
    return (
        <Tooltip
            text={tags.map(renderTag)}
            tooltipClassName="vc-better-forums-extra-tags-tooltip"
            tooltipContentClassName="vc-better-forums-extra-tags"
        >
            {props => (
                <div className="vc-better-forums-tag" {...props}>
                    <BaseText size="xs" weight="semibold" style={{ color: "currentcolor" }}>
                        +{tags.length}
                    </BaseText>
                </div>
            )}
        </Tooltip>
    );
});
