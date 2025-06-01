/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { Channel, Guild, User } from "discord-types/general";

import { useUsers } from "../utils";

interface FacePileProps {
    users: User[];
    guildId: Guild["id"];
    className?: string;
    count?: number;
    max?: number;
    hideMoreUsers?: boolean;
    renderMoreUsers?: boolean;
    showDefaultAvatarsForNullUsers?: boolean;
    size?: 16 | 24 | 32 | 56;
    showUserPopout?: boolean;
    useFallbackUserForPopout?: boolean;
    renderIcon?: boolean;
    renderUser?: React.FC<Omit<FacePileProps, "renderUser">>;
}

const FacePile = findComponentByCodeLazy<FacePileProps>("this.props.renderIcon");

interface ActiveUsersProps {
    channel: Channel;
    userIds: User["id"][];
    facepileRef: React.Ref<HTMLDivElement>;
}

export function ActiveUsers({ channel, userIds, facepileRef }: ActiveUsersProps) {
    const users = useUsers(channel, userIds);
    return (
        <div ref={facepileRef}>
            <FacePile
                className={"__invalid_facepile"}
                showDefaultAvatarsForNullUsers={true}
                guildId={channel.getGuildId()}
                users={users}
                max={5}
                size={16}
                hideMoreUsers={true}
                showUserPopout={true}
            />
        </div>
    );
}
