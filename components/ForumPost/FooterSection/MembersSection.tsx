/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FooterSection } from ".";
import { ThreadChannel } from "../../../types";
import { _memo } from "../../../utils";
import { AvatarPile } from "../../AvatarPile";
import { UsersIcon } from "../../icons";

interface MembersSectionProps {
    channel: ThreadChannel;
}

export const MembersSection = _memo<MembersSectionProps>(function MembersSection({ channel }) {
    return (
        <FooterSection icon={<UsersIcon />} text={channel.memberCount.toString()}>
            {channel.memberIdsPreview.length > 0 && (
                <AvatarPile
                    guildId={channel.getGuildId()}
                    userIds={channel.memberIdsPreview}
                    size={16}
                    count={channel.memberCount}
                />
            )}
        </FooterSection>
    );
});
