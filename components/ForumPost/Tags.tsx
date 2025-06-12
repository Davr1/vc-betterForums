/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getUserSettingLazy } from "@api/UserSettings";
import { copyToClipboard } from "@utils/clipboard";
import { getIntlMessage } from "@utils/discord";
import { ContextMenuApi, Menu, useCallback } from "@webpack/common";
import { MouseEvent } from "react";

import { cl } from "../..";
import { useForumChannelState, useTags } from "../../hooks";
import { MaxTagCount, settings } from "../../settings";
import { Tag as TagType, ThreadChannel } from "../../types";
import { _memo } from "../../utils";
import { Icons } from "../icons";
import { MoreTags, Tag } from "../Tags";

const DeveloperMode = getUserSettingLazy<boolean>("appearance", "developerMode")!;

interface TagsContextMenuProps {
    tag: TagType;
}

function TagsContextMenu({ tag }: TagsContextMenuProps) {
    const isDev = DeveloperMode.useSetting();
    const copy = useCallback(() => copyToClipboard(tag.id), [tag.id]);

    return (
        <Menu.Menu
            navId="forum-tag"
            onClose={ContextMenuApi.closeContextMenu}
            aria-label={getIntlMessage("FORUM_TAG_ACTIONS_MENU_LABEL")}
        >
            {isDev && !tag.custom && (
                <Menu.MenuItem
                    id="copy-tag-id"
                    label={getIntlMessage("COPY_ID_FORUM_TAG")}
                    action={copy}
                    icon={Icons.IdIcon}
                />
            )}
        </Menu.Menu>
    );
}

TagsContextMenu.open = (event: MouseEvent<HTMLDivElement>, tag: TagType) => {
    ContextMenuApi.openContextMenu(event, () => <TagsContextMenu tag={tag} />);
};

interface TagsProps {
    channel: ThreadChannel;
    tagsClassName?: string;
}

export const Tags = _memo<TagsProps>(function Tags({ channel, tagsClassName }) {
    const { maxTagCount } = settings.use(["maxTagCount"]);

    const tags = useTags(channel);
    const { tagFilter } = useForumChannelState(channel.parent_id);

    const renderTag = useCallback(
        (tag: TagType) => (
            <Tag
                tag={tag}
                className={cl(tagsClassName, {
                    "vc-better-forums-tag-filtered": tagFilter.has(tag.id),
                })}
                key={tag.id}
                onContextMenu={TagsContextMenu.open}
            />
        ),
        [tagFilter]
    );

    if (tags.length === 0 || maxTagCount === MaxTagCount.OFF) return null;

    return [
        tags.slice(0, maxTagCount).map(renderTag),
        tags.length > maxTagCount && (
            <MoreTags tags={tags.slice(maxTagCount)} renderTag={renderTag} />
        ),
    ];
});
