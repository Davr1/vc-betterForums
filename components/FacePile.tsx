/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Guild, User } from "@vencord/discord-types";
import { findComponentByCodeLazy } from "@webpack";
import { ComponentType, ReactNode } from "react";

export interface FacePileProps {
    users: User[];
    guildId: Guild["id"];
    className?: string;
    count?: number;
    max?: number;
    hideMoreUsers?: boolean;
    renderMoreUsers?: (text: string, extraCount: number) => ReactNode;
    showDefaultAvatarsForNullUsers?: boolean;
    size?: 16 | 24 | 32 | 56;
    showUserPopout?: boolean;
    useFallbackUserForPopout?: boolean;
    renderIcon?: boolean;
    renderUser?: ComponentType<Omit<FacePileProps, "renderUser">>;
}

export const FacePile = findComponentByCodeLazy<FacePileProps>("this.props.renderIcon");
