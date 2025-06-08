/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorBoundary } from "@components/index";
import { getIntlMessage } from "@utils/discord";
import { ChannelStore, Clickable, Flex, useEffect, useStateFromStores } from "@webpack/common";
import { Channel } from "discord-types/general";
import { ComponentProps, ComponentType, Ref } from "react";

import { cl } from "../..";
import {
    useFirstMessage,
    useFocusRing,
    useForumPostComposerStore,
    useForumPostEvents,
    useForumPostMetadata,
    useMessageCount,
} from "../../hooks";
import { ChannelSectionStore } from "../../stores";
import { ThreadChannel } from "../../types";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Media } from "./Media";
import { Tags } from "./Tags";

const ClickableWithRing: ComponentType<
    ComponentProps<typeof Clickable> & {
        focusProps: { ringTarget: Ref<HTMLElement> };
    }
> = Clickable;

interface ForumPostProps {
    goToThread: (channel: Channel, _: boolean) => void;
    threadId: string;
}

export function ForumPost({ goToThread, threadId }: ForumPostProps) {
    const channel = useStateFromStores(
        [ChannelStore],
        () => ChannelStore.getChannel(threadId) as ThreadChannel,
        [threadId]
    );

    const isOpen = useStateFromStores(
        [ChannelSectionStore],
        () => ChannelSectionStore.getCurrentSidebarChannelId(channel.parent_id) === channel.id,
        [channel.parent_id, channel.id]
    );

    const { firstMessage } = useFirstMessage(channel);
    const { firstMedia } = useForumPostMetadata({ firstMessage });
    const { messageCountText } = useMessageCount(channel.id);

    const { ref: ringTarget, width, height } = useFocusRing<HTMLDivElement>();
    const { handleLeftClick, handleRightClick } = useForumPostEvents({
        goToThread,
        channel,
        facepileRef: () => {},
    });

    const setCardHeight = useForumPostComposerStore(store => store.setCardHeight);
    useEffect(() => {
        if (typeof height === "number") setCardHeight(threadId, height);
    }, [height, setCardHeight, threadId]);

    return (
        <ErrorBoundary>
            <Flex
                ref={ringTarget}
                data-item-id={threadId}
                onClick={handleLeftClick}
                onContextMenu={handleRightClick}
                direction={Flex.Direction.VERTICAL}
                className={cl("vc-better-forums-thread", {
                    "vc-better-forums-thread-open": isOpen,
                })}
            >
                <ClickableWithRing
                    onClick={handleLeftClick}
                    focusProps={{ ringTarget }}
                    onContextMenu={handleRightClick}
                    aria-label={getIntlMessage("FORUM_POST_ARIA_LABEL", {
                        title: channel.name,
                        count: messageCountText,
                    })}
                    style={{ display: "none" }}
                />
                <Flex className="vc-better-forums-thread-body-container">
                    <ForumPost.Body channel={channel} firstMessage={firstMessage} />
                    {firstMedia && <ForumPost.Media {...firstMedia} />}
                </Flex>
                <ForumPost.Footer
                    channel={channel}
                    firstMessage={firstMessage}
                    containerWidth={width}
                />
            </Flex>
        </ErrorBoundary>
    );
}

ForumPost.Media = Media;
ForumPost.Body = Body;
ForumPost.Footer = Footer;
ForumPost.Tags = Tags;
