/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { User } from "@vencord/discord-types";

import { useUsers } from "../hooks";
import { _memo } from "../utils";
import { UserSummaryItem, UserSummaryItemProps } from "./UserSummaryItem";

interface AvatarPileProps extends Omit<UserSummaryItemProps, "users"> {
    userIds: User["id"][];
}

const renderMoreUsers = (text: string) => (
    <div className="vc-better-forums-extra-member-count">{text}</div>
);

export const AvatarPile = _memo<AvatarPileProps>(function AvatarPile({
    guildId,
    userIds,
    max = 99,
    ...props
}) {
    const users = useUsers(guildId, userIds, 5);
    return (
        <UserSummaryItem
            guildId={guildId}
            users={users}
            max={max}
            count={userIds.length}
            renderMoreUsers={renderMoreUsers}
            {...props}
        />
    );
});
