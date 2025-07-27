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

import {
    useAppliedTags,
    useForumChannelState,
    useForumChannelStore,
    useTagActions,
} from "../../hooks";
import { MaxTagCount, settings } from "../../settings";
import { CustomTag, ThreadChannel } from "../../types";
import { _memo } from "../../utils";
import { Icons } from "../icons";
import { TagEditorModal } from "../Settings";
import { MoreTags, Tag } from "../Tags";

const DeveloperMode = getUserSettingLazy<boolean>("appearance", "developerMode")!;

interface TagsContextMenuProps {
    tag: CustomTag;
}

function TagsContextMenu({ tag }: TagsContextMenuProps) {
    const isDev = DeveloperMode.useSetting();
    const copy = useCallback(() => copyToClipboard(tag.id), [tag.id]);
    const { updateTag } = useTagActions();
    const openEditor = TagEditorModal.use(tag.id, updateTag);

    return (
        <Menu.Menu
            navId="forum-tag"
            onClose={ContextMenuApi.closeContextMenu}
            aria-label={getIntlMessage("FORUM_TAG_ACTIONS_MENU_LABEL")}
        >
            <Menu.MenuItem id="edit-tag" label="Edit tag" action={openEditor} icon={Icons.Pencil} />
            {isDev && !tag.custom && (
                <Menu.MenuItem
                    id="copy-tag-id"
                    label={getIntlMessage("COPY_ID_FORUM_TAG")}
                    action={copy}
                    icon={Icons.Id}
                />
            )}
        </Menu.Menu>
    );
}

TagsContextMenu.open = (event: MouseEvent<HTMLDivElement>, tag: CustomTag) => {
    ContextMenuApi.openContextMenu(event, () => <TagsContextMenu tag={tag} />);
};

interface TagsProps {
    channel: ThreadChannel;
    tagsClassName?: string;
}

export const Tags = _memo<TagsProps>(function Tags({ channel, tagsClassName }) {
    const { maxTagCount } = settings.use(["maxTagCount"]);

    const tags = useAppliedTags(channel);
    const { tagFilter } = useForumChannelState(channel.parent_id);

    const store = useForumChannelStore();
    const toggleTagFilter = useCallback(
        (_: unknown, tag: CustomTag) => store?.toggleTagFilter(channel.parent_id, tag.id),
        [channel.parent_id]
    );

    const renderTag = useCallback(
        (tag: CustomTag) => (
            <Tag
                tag={tag}
                className={tagsClassName}
                filtered={tagFilter.has(tag.id)}
                key={tag.id}
                onClick={tag.custom ? undefined : toggleTagFilter}
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
