/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { useMemo } from "@webpack/common";
import { Channel } from "discord-types/general";
import { MouseEventHandler, Ref } from "react";

interface Options {
    facepileRef?: Ref<HTMLElement>;
    goToThread: (channel: Channel, shiftKey: boolean) => void;
    channel: Channel;
}

export const getForumPostEvents: (options: Options) => {
    handleLeftClick: MouseEventHandler<unknown>;
    handleRightClick: MouseEventHandler<unknown>;
} = findByCodeLazy("facepileRef:", "handleLeftClick");

const facepileRef: Options["facepileRef"] = () => {};
export function useForumPostEvents({ channel, goToThread }: Omit<Options, "facepileRef">) {
    return useMemo(
        () => getForumPostEvents({ channel, goToThread, facepileRef }),
        [channel, goToThread]
    );
}
