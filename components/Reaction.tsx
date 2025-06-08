/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LazyComponent } from "@utils/lazyReact";
import {
    ChannelStore,
    React,
    useLayoutEffect,
    useRef,
    useState,
    useStateFromStores,
} from "@webpack/common";
import { Message } from "discord-types/general";
import { Ref } from "react";

import { cl } from "..";
import { useCheckPermissions, useDefaultEmoji, useTopReactions } from "../hooks";
import { ForumChannel, ReactionType, ThreadChannel } from "../types";
import { _memo } from "../utils";
import { ReactionButton, ReactionButtonProps } from "./ReactionButton";

type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
interface ReactionContainerProps
    extends PartiallyOptional<ReactionButtonProps, "me" | "me_burst" | "count" | "burst_count"> {
    visible?: boolean;
}

const ReactionContainer = LazyComponent(() =>
    React.forwardRef(function ReactionContainer(
        {
            visible = true,
            count = 0,
            burst_count = 0,
            me = false,
            me_burst = false,
            useChatFontScaling = false,
            emojiSize = "reaction",
            emojiSizeTooltip = "reaction",
            className = "vc-better-forums-reaction-button",
            ...props
        }: ReactionContainerProps,
        ref: Ref<HTMLDivElement>
    ) {
        return (
            <div
                ref={ref}
                className={cl("vc-better-forums-reaction", {
                    "vc-better-forums-reaction-hidden": !visible,
                })}
            >
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
    })
);

interface ReactionProps {
    firstMessage: Message;
    channel: ThreadChannel;
    maxWidth?: number;
    maxCount?: number;
}

export const DefaultReaction = _memo<ReactionProps>(function DefaultReaction({
    firstMessage,
    channel,
}) {
    const forumChannel = useStateFromStores(
        [ChannelStore],
        () => ChannelStore.getChannel(channel.parent_id) as ForumChannel,
        [channel.parent_id]
    );
    const defaultEmoji = useDefaultEmoji(forumChannel);
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);

    if (!defaultEmoji || disableReactionCreates) return null;

    return (
        <ReactionContainer
            message={firstMessage}
            readOnly={channel.isArchivedLockedThread()}
            isLurking={isLurking}
            isPendingMember={isPendingMember}
            emoji={defaultEmoji}
            hideCount
            type={ReactionType.NORMAL}
        />
    );
});

export const Reactions = _memo<ReactionProps>(function Reactions({
    firstMessage,
    channel,
    maxWidth,
    maxCount,
}) {
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);
    const reactions = useTopReactions(firstMessage, maxCount);

    const [visibleReactions, setVisibleReactions] = useState(reactions.length);
    const refs = useRef<Array<HTMLDivElement | null>>([]);

    if (reactions.length !== refs.current.length) {
        refs.current = Array.from({ length: reactions.length }, (_, i) => refs.current[i] ?? null);
    }

    useLayoutEffect(() => {
        if (!maxWidth || reactions.length === 0) return;

        let count = 0;
        let width = 0;

        for (const ref of refs.current) {
            if (!ref) break;
            width += ref.offsetWidth + 6 /* (gap) */;
            if (width >= maxWidth) break;
            count++;
        }

        setVisibleReactions(count);
    }, [maxWidth, reactions]);

    if (reactions.length === 0) return null;

    return (
        <div className="vc-better-forums-reactions">
            {reactions.map((reaction, i) => (
                <ReactionContainer
                    message={firstMessage}
                    readOnly={disableReactionCreates || channel.isArchivedLockedThread()}
                    isLurking={isLurking}
                    isPendingMember={isPendingMember}
                    type={reaction.type}
                    key={reaction.id}
                    visible={i < visibleReactions || i === 0}
                    ref={ref => {
                        refs.current[i] = ref;
                    }}
                    {...reaction.reaction}
                />
            ))}
        </div>
    );
});
