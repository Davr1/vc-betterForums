/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { lodash } from "@webpack/common";

import { ThreadMembersStore } from "../../../stores";
import { ThreadChannel } from "../../../types";
import { _memo } from "../../../utils";
import { AvatarPile } from "../../AvatarPile";
import { Icons } from "../../icons";
import { FooterSection } from "./";

interface MembersSectionProps {
    channel: ThreadChannel;
}

export const MembersSection = _memo<MembersSectionProps>(function MembersSection({ channel }) {
    const { count, memberIds } = ThreadMembersStore.use(
        $ => ({
            count: $.getMemberCount(channel.id) ?? 0,
            memberIds: $.getMemberIdsPreview(channel.id) ?? [],
        }),
        [channel.id],
        lodash.isEqual
    );

    return (
        <FooterSection icon={<Icons.Users />} text={`${count}`}>
            {memberIds.length > 0 && (
                <AvatarPile
                    guildId={channel.getGuildId()}
                    userIds={memberIds}
                    size={16}
                    count={count}
                />
            )}
        </FooterSection>
    );
});
