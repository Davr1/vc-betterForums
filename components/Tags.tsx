/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text, Tooltip } from "@webpack/common";

export function Tag({ tag: { name }, className, selected }) {
    return (
        <div className={className}>
            <Text variant="text-xs/semibold" lineClamp={1} color="currentColor">
                {name}
            </Text>
        </div>
    );
}

export function MoreTags({ tags, count, size = 1 }) {
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
