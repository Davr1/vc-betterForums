/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";
import { Channel } from "discord-types/general";

import { useUsers } from "../utils";

const FacePile = findByCodeLazy("this.props.renderIcon");

interface ActiveUsersProps {
    channel: Channel;
    userIds: string[];
    facepileRef: any;
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
