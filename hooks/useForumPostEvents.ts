/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel } from "discord-types/general";
import { MouseEventHandler, Ref } from "react";

export const useForumPostEvents: (options: {
    facepileRef?: Ref<HTMLElement>;
    goToThread: (channel: Channel, flag: boolean) => void;
    channel: Channel;
}) => {
    handleLeftClick: MouseEventHandler<unknown>;
    handleRightClick: MouseEventHandler<unknown>;
} = findByCodeLazy("facepileRef:", "handleLeftClick");
