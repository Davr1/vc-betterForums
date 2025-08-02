/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Menu } from "@vencord/discord-types";
import { DefaultExtractAndLoadChunksRegex, extractAndLoadChunksLazy } from "@webpack";
import { ComponentProps, ComponentType } from "react";

import { ThreadChannel } from "../../types";
import { findSingleExportLazy } from "../../utils";

export const requireThreadContextMenu = extractAndLoadChunksLazy(
    ["openThreadContextMenu"],
    new RegExp("openThreadContextMenu.{1,150}?" + DefaultExtractAndLoadChunksRegex.source)
);

interface ThreadContextMenuProps extends ComponentProps<Menu["Menu"]> {
    channel: ThreadChannel;
}

export const ThreadContextMenu = findSingleExportLazy<ComponentType<ThreadContextMenuProps>>(
    ".CHANNEL_LIST_THREAD_MENU]"
);
