/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Guild, User } from "discord-types/general";
import { ComponentType, ReactNode } from "react";

import { useUsers } from "../utils";

interface FacePileProps {
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

const FacePile = findComponentByCodeLazy<FacePileProps>("this.props.renderIcon");

interface AvatarPileProps extends Omit<FacePileProps, "users"> {
    userIds: User["id"][];
}

function renderMoreUsers(text: string) {
    return <div className="vc-better-forums-extra-member-count">{text}</div>;
}

export function AvatarPile({ guildId, userIds, max = 99, ...props }: AvatarPileProps) {
    const users = useUsers(guildId, userIds, 5);
    return (
        <FacePile
            guildId={guildId}
            users={users}
            max={max}
            count={userIds.length}
            renderMoreUsers={renderMoreUsers}
            {...props}
        />
    );
}
