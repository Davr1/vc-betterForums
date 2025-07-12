/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@webpack/common";
import { Ref } from "react";

import { useCheckPermissions, useDefaultEmoji, useSortedReactions } from "../hooks";
import { ChannelStore } from "../stores";
import {
    ForumChannel,
    FullMessage,
    PartiallyOptional,
    ReactionType,
    ThreadChannel,
} from "../types";
import { _memo } from "../utils";
import { DynamicList } from "./DynamicList";
import { ReactionButton, ReactionButtonProps } from "./ReactionButton";

interface ReactionContainerProps
    extends PartiallyOptional<ReactionButtonProps, "me" | "me_burst" | "count" | "burst_count"> {
    ref?: Ref<HTMLDivElement>;
}

function ReactionContainer({
    count = 0,
    burst_count = 0,
    me = false,
    me_burst = false,
    useChatFontScaling = false,
    emojiSize = "reaction",
    emojiSizeTooltip = "reaction",
    className = "vc-better-forums-reaction-button",
    ref,
    isPendingMember = false,
    ...props
}: ReactionContainerProps) {
    return (
        <div className="vc-better-forums-reaction" ref={ref}>
            <ReactionButton
                count={count}
                burst_count={burst_count}
                me={me}
                me_burst={me_burst}
                useChatFontScaling={useChatFontScaling}
                emojiSize={emojiSize}
                emojiSizeTooltip={emojiSizeTooltip}
                className={className}
                {...props}
            />
        </div>
    );
}

interface ReactionProps {
    firstMessage: FullMessage;
    channel: ThreadChannel;
    maxWidth?: number;
    maxCount?: number;
}

export const DefaultReaction = _memo<ReactionProps>(function DefaultReaction({
    firstMessage,
    channel,
}) {
    const forumChannel = ChannelStore.use(
        $ => $.getChannel(channel.parent_id) as ForumChannel,
        [channel.parent_id]
    );

    const defaultEmoji = useDefaultEmoji(forumChannel);
    const { disableReactionCreates, isLurking } = useCheckPermissions(channel);

    if (!defaultEmoji || disableReactionCreates) return null;

    return (
        <ReactionContainer
            message={firstMessage}
            readOnly={channel.isArchivedLockedThread()}
            isLurking={isLurking}
            emoji={defaultEmoji}
            hideCount
            type={ReactionType.NORMAL}
        />
    );
});

const visibilityPredicate = (_: unknown, i: number, max: number) => i < max || i === 0;

export const Reactions = _memo<ReactionProps>(function Reactions({
    firstMessage,
    channel,
    maxWidth,
    maxCount,
}) {
    const { disableReactionCreates, isLurking } = useCheckPermissions(channel);
    const readOnly = disableReactionCreates || channel.isArchivedLockedThread();

    const reactions = useSortedReactions(firstMessage);

    if (reactions.length === 0) return null;

    return (
        <DynamicList
            items={reactions}
            maxWidth={maxWidth}
            maxCount={maxCount}
            direction={Flex.Direction.HORIZONTAL_REVERSE}
            align={Flex.Align.STRETCH}
            gap={6}
            predicate={visibilityPredicate}
            className="vc-better-forums-reactions"
        >
            {(reaction, ref: Ref<HTMLDivElement>) => (
                <ReactionContainer
                    message={firstMessage}
                    readOnly={readOnly}
                    isLurking={isLurking}
                    type={reaction.type}
                    ref={ref}
                    {...reaction.reaction}
                />
            )}
        </DynamicList>
    );
});
