/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Guild, User } from "discord-types/general";

import { useUsers } from "../utils";

interface FacePileProps {
    users: User[];
    guildId: Guild["id"];
    className?: string;
    count?: number;
    max?: number;
    hideMoreUsers?: boolean;
    renderMoreUsers?: (text: string, extraCount: number) => React.ReactNode;
    showDefaultAvatarsForNullUsers?: boolean;
    size?: 16 | 24 | 32 | 56;
    showUserPopout?: boolean;
    useFallbackUserForPopout?: boolean;
    renderIcon?: boolean;
    renderUser?: React.FC<Omit<FacePileProps, "renderUser">>;
}

const FacePile = findComponentByCodeLazy<FacePileProps>("this.props.renderIcon");

interface AvatarPileProps extends Omit<FacePileProps, "users"> {
    userIds: User["id"][];
}

export function AvatarPile({ guildId, userIds, max, ...props }: AvatarPileProps) {
    const users = useUsers(guildId, userIds.slice(0, max));
    return <FacePile guildId={guildId} users={users} max={max} count={userIds.length} {...props} />;
}
