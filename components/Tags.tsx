/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Text, Tooltip } from "@webpack/common";
import { ReactionEmoji } from "discord-types/general";

import { cl } from "..";
import { Tag as TagType } from "../utils";
import { EmojiSize } from "./Reaction";

interface EmojiProps {
    animated?: boolean;
    className?: string;
    emojiId: ReactionEmoji["id"] | null;
    emojiName: ReactionEmoji["name"] | null;
    size?: EmojiSize;
}

const Emoji = findComponentByCodeLazy<EmojiProps>(/void 0===\i\.shouldAnimate/);

interface TagProps {
    tag: TagType;
    className?: string;
}

export function Tag({ tag: { name, emojiId, emojiName }, className }: TagProps) {
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
    count: number;
}

export function MoreTags({ tags, count }: MoreTagsProps) {
    return (
        <Tooltip
            text={tags.map(tag => (
                <Tag tag={tag} key={tag.id} />
            ))}
        >
            {props => (
                <div {...props}>
                    <Text variant="text-xs/semibold">+{count}</Text>
                </div>
            )}
        </Tooltip>
    );
}
