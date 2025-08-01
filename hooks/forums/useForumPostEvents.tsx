/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ContextMenuApi, useMemo } from "@webpack/common";
import { MouseEvent } from "react";

import {
    requireThreadContextMenu,
    ThreadContextMenu,
} from "../../components/ContextMenus/ThreadContextMenu";
import { ForumPostEventOptions } from "../../types";

export function useForumPostEvents({ channel, goToThread }: ForumPostEventOptions) {
    return useMemo(
        () => ({
            handleLeftClick: (e: MouseEvent) => e.target && goToThread(channel, e.shiftKey),
            handleRightClick: (e: MouseEvent) =>
                ContextMenuApi.openContextMenuLazy(e, () =>
                    requireThreadContextMenu().then(() => menuProps => (
                        <ThreadContextMenu channel={channel} {...menuProps} />
                    ))
                ),
        }),
        [channel, goToThread]
    );
}
