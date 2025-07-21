/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorBoundary } from "@components/index";
import { getIntlMessage } from "@utils/discord";
import { Channel } from "@vencord/discord-types";
import { Clickable, Flex, useEffect } from "@webpack/common";
import { ComponentProps, ComponentType, Ref } from "react";

import { cl } from "../..";
import {
    useFirstMessage,
    useFocusRing,
    useForumPostComposerStore,
    useForumPostEvents,
    useMessageCount,
} from "../../hooks";
import { ChannelSectionStore, ChannelStore } from "../../stores";
import { ThreadChannel } from "../../types";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Media } from "./Media";
import { Tags } from "./Tags";
import { Title } from "./Title";

const ClickableWithRing: ComponentType<
    ComponentProps<typeof Clickable> & {
        focusProps: { ringTarget: Ref<HTMLElement> };
    }
> = Clickable;

const mediaThreshold = 500;

interface ForumPostProps {
    goToThread: (channel: Channel, shiftKey: boolean) => void;
    threadId: Channel["id"];
}

export function ForumPost({ goToThread, threadId }: ForumPostProps) {
    const channel = ChannelStore.use($ => $.getChannel(threadId) as ThreadChannel, [threadId]);

    const isOpen = ChannelSectionStore.use(
        $ => $.getCurrentSidebarChannelId(channel.parent_id) === channel.id,
        [channel.parent_id, channel.id]
    );

    const { firstMessage } = useFirstMessage(channel);
    const { messageCountText } = useMessageCount(channel);

    const { ref: ringTarget, width, height } = useFocusRing<HTMLDivElement>();
    const { handleLeftClick, handleRightClick } = useForumPostEvents({ goToThread, channel });

    const setCardHeight = useForumPostComposerStore(store => store.setCardHeight);
    useEffect(() => {
        if (typeof height === "number") setCardHeight(threadId, height);
    }, [height, setCardHeight, threadId]);

    return (
        <ErrorBoundary>
            <ClickableWithRing
                onClick={handleLeftClick}
                focusProps={{ ringTarget }}
                onContextMenu={handleRightClick}
                aria-label={getIntlMessage("FORUM_POST_ARIA_LABEL", {
                    title: channel.name,
                    count: messageCountText,
                })}
            >
                <Flex
                    ref={ringTarget}
                    data-item-id={threadId}
                    direction={Flex.Direction.VERTICAL}
                    className={cl("vc-better-forums-thread", {
                        "vc-better-forums-thread-open": isOpen,
                    })}
                >
                    <Flex className="vc-better-forums-thread-body-container">
                        <ForumPost.Body channel={channel} message={firstMessage} />
                        <ForumPost.Media message={firstMessage} maxWidth={width - mediaThreshold} />
                    </Flex>
                    <ForumPost.Footer
                        channel={channel}
                        message={firstMessage}
                        containerWidth={width}
                    />
                </Flex>
            </ClickableWithRing>
        </ErrorBoundary>
    );
}

ForumPost.Media = Media;
ForumPost.Body = Body;
ForumPost.Footer = Footer;
ForumPost.Tags = Tags;
ForumPost.Title = Title;
