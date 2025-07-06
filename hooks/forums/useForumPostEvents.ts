/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { useMemo } from "@webpack/common";
import { MouseEventHandler } from "react";

import { ForumPostEventOptions } from "../../types";

// TODO: rewrite if I find a cleaner way to import the context menu
export const getForumPostEvents: (options: ForumPostEventOptions) => {
    handleLeftClick: MouseEventHandler<unknown>;
    handleRightClick: MouseEventHandler<unknown>;
} = findByCodeLazy("facepileRef:", "handleLeftClick");

const facepileRef: ForumPostEventOptions["facepileRef"] = () => {};
export function useForumPostEvents({
    channel,
    goToThread,
}: Omit<ForumPostEventOptions, "facepileRef">) {
    return useMemo(
        () => getForumPostEvents({ channel, goToThread, facepileRef }),
        [channel, goToThread]
    );
}
