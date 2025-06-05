/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";
import { ChannelStore, useStateFromStores } from "@webpack/common";
import { Message } from "discord-types/general";

import {
    ForumChannel,
    MessageReactionWithBurst,
    ThreadChannel,
    useCheckPermissions,
    useDefaultEmoji,
    useTopReaction,
} from "../utils";

enum ReactionType {
    NORMAL = 0,
    BURST = 1,
    VOTE = 2,
}

export type EmojiSize = "reaction" | "jumbo";

interface ReactionButtonProps extends MessageReactionWithBurst {
    className?: string;
    message: Message;
    readOnly?: boolean;
    useChatFontScaling?: boolean;
    isLurking?: boolean;
    isPendingMember?: boolean;
    hideCount?: boolean;
    type?: ReactionType;
    emojiSize?: EmojiSize;
    emojiSizeTooltip?: EmojiSize;
}
const ReactionButton = findComponentByCodeLazy<ReactionButtonProps>("getReactionPickerAnimation");

const reactionButtonDefaultProps = {
    count: 0,
    burst_count: 0,
    me: false,
    me_burst: false,
    useChatFontScaling: false,
    emojiSize: "reaction",
    emojiSizeTooltip: "reaction",
    className: "vc-better-forums-reaction-button",
} as const satisfies Partial<ReactionButtonProps>;

interface ReactionProps {
    firstMessage: Message;
    channel: ThreadChannel;
}

export function DefaultReaction({ firstMessage, channel }: ReactionProps) {
    const forumChannel = useStateFromStores(
        [ChannelStore],
        () => ChannelStore.getChannel(channel.parent_id) as ForumChannel
    );
    const defaultEmoji = useDefaultEmoji(forumChannel);
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);

    if (!defaultEmoji || disableReactionCreates) return null;

    return (
        <ReactionButton
            {...reactionButtonDefaultProps}
            message={firstMessage}
            readOnly={channel.isArchivedLockedThread()}
            isLurking={isLurking}
            isPendingMember={isPendingMember}
            emoji={defaultEmoji}
            hideCount
            type={ReactionType.NORMAL}
        />
    );
}

export function Reactions({ firstMessage, channel }: ReactionProps) {
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);
    const reaction = useTopReaction(firstMessage);
    if (!reaction) return null;

    return (
        <ReactionButton
            {...reactionButtonDefaultProps}
            message={firstMessage}
            readOnly={disableReactionCreates || channel.isArchivedLockedThread()}
            isLurking={isLurking}
            isPendingMember={isPendingMember}
            type={reaction.burst_count >= reaction.count ? ReactionType.BURST : ReactionType.NORMAL}
            key={reaction.emoji.id}
            {...reaction}
        />
    );
}
