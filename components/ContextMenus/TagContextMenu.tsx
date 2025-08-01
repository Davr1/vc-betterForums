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

import { useTagActions } from "../../hooks";
import { CustomTag } from "../../types";
import { Icons } from "../icons";
import { TagEditorModal } from "../Settings";

const DeveloperMode = getUserSettingLazy<boolean>("appearance", "developerMode")!;

interface TagsContextMenuProps {
    tag: CustomTag;
}

export function TagsContextMenu({ tag }: TagsContextMenuProps) {
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
