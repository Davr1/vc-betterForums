/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChannelStore, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { ForumChannel, useCheckPermissions, useDefaultEmoji } from "../utils";

let ReactionButton: React.FC<any> = () => <></>;

export function setReactionButton(button: React.FC) {
    ReactionButton = button;
}

interface ReactionProps {
    firstMessage: Message;
    channel: Channel;
}
export function EmptyReaction({ firstMessage, channel }: ReactionProps) {
    const forumChannel = useStateFromStores(
        [ChannelStore],
        () => ChannelStore.getChannel(channel.parent_id) as ForumChannel
    );
    const defaultEmoji = useDefaultEmoji(forumChannel);
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);

    if (!defaultEmoji || disableReactionCreates) return null;

    return (
        <ReactionButton
            className={"updateReactionButton"}
            message={firstMessage}
            readOnly={(channel as any).isArchivedLockedThread()}
            useChatFontScaling={false}
            isLurking={isLurking}
            isPendingMember={isPendingMember}
            emoji={defaultEmoji}
            hideCount={true}
            count={0}
            burst_count={0}
            me={false}
            me_burst={false}
            type={0}
            emojiSize="reaction"
            emojiSizeTooltip="reaction"
        />
    );
}

export function Reaction({ firstMessage, channel }: ReactionProps) {
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);

    return firstMessage.reactions.map(reaction => (
        <ReactionButton
            className={"updateReactionButton"}
            message={firstMessage}
            readOnly={disableReactionCreates || (channel as any).isArchivedLockedThread()}
            isLurking={isLurking}
            isPendingMember={isPendingMember}
            useChatFontScaling={false}
            type={(reaction as any).burst_count >= reaction.count ? 1 : 0}
            emojiSize="reaction"
            emojiSizeTooltip="reaction"
            key={reaction.emoji.id}
            {...reaction}
        >
            {`${reaction.emoji.id ?? "0"}:${reaction.emoji.name}`}
        </ReactionButton>
    ));
}
