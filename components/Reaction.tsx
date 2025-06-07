/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { LazyComponent } from "@utils/lazyReact";
import { findComponentByCodeLazy } from "@webpack";
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
import {
    ForumChannel,
    memoizedComponent,
    MessageReactionWithBurst,
    ReactionType,
    ThreadChannel,
    useCheckPermissions,
    useDefaultEmoji,
    useTopReactions,
} from "../utils";

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

interface ReactionContainerProps extends ReactionButtonProps {
    visible?: boolean;
}

const ReactionContainer = LazyComponent(() =>
    React.forwardRef(function ReactionContainer(
        { visible = true, ...props }: ReactionContainerProps,
        ref: Ref<HTMLDivElement>
    ) {
        return (
            <div
                ref={ref}
                className={cl("vc-better-forums-reaction", {
                    "vc-better-forums-reaction-hidden": !visible,
                })}
            >
                <ReactionButton {...props} />
            </div>
        );
    })
);

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
    maxWidth?: number;
    maxCount?: number;
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
        <ReactionContainer
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

export const Reactions = memoizedComponent<ReactionProps>(function Reactions({
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
                    {...reactionButtonDefaultProps}
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
