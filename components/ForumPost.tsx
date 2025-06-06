/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorBoundary } from "@components/index";
import { getIntlMessage } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { findByCodeLazy } from "@webpack";
import { ChannelStore, Clickable, Flex, useEffect, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { cl } from "..";
import { ChannelSectionStore, ForumPostComposerStore } from "../stores";
import { ThreadChannel, useForumPostMetadata, useMessageCount } from "../utils";
import { ForumPostBody } from "./ForumPostBody";
import { ForumPostFooter } from "./ForumPostFooter";
import { ForumPostMedia } from "./ForumPostMedia";

const ClickableWithRing: React.FC<
    React.ComponentProps<typeof Clickable> & {
        focusProps: { ringTarget: React.Ref<HTMLElement> };
    }
> = Clickable;

const useFirstMessage: (channel: Channel) => { loaded: boolean; firstMessage: Message | null } =
    findByCodeLazy("loaded:", "firstMessage:", "getChannel", "getMessage");

const useFocusRing: <T extends HTMLElement = HTMLElement>() => {
    ref: React.Ref<T>;
    width: number;
    height: number | null;
} = findByCodeLazy(/,\{ref:\i,width:\i,height:\i\}\}/);

const useForumPostComposerStore: <T>(
    selector: (store: ForumPostComposerStore) => T,
    compareFn?: (a: unknown, b: unknown) => boolean
) => T = findByCodeLazy("[useForumPostComposerStore]", ")}");

const useForumPostEvents: (options: {
    facepileRef?: React.Ref<HTMLElement>;
    goToThread: ForumPostProps["goToThread"];
    channel: Channel;
}) => {
    handleLeftClick: React.MouseEventHandler<unknown>;
    handleRightClick: React.MouseEventHandler<unknown>;
} = findByCodeLazy("facepileRef:", "handleLeftClick");

interface ForumPostProps {
    goToThread: (channel: Channel, _: boolean) => void;
    threadId: string;
}

export const ForumPost = LazyComponent(
    () =>
        function ForumPost({ goToThread, threadId }: ForumPostProps) {
            const channel = useStateFromStores(
                [ChannelStore],
                () => ChannelStore.getChannel(threadId) as ThreadChannel
            );
            const isOpen = useStateFromStores(
                [ChannelSectionStore],
                () =>
                    ChannelSectionStore.getCurrentSidebarChannelId(channel.parent_id) === channel.id
            );

            const { firstMessage } = useFirstMessage(channel);
            const { firstMedia } = useForumPostMetadata({ firstMessage });
            const { messageCountText } = useMessageCount(channel.id);
            const { ref: ringTarget, width, height } = useFocusRing<HTMLDivElement>();
            const setCardHeight = useForumPostComposerStore(store => store.setCardHeight);

            useEffect(() => {
                if (typeof height === "number") setCardHeight(threadId, height);
            }, [height, setCardHeight, threadId]);

            const { handleLeftClick, handleRightClick } = useForumPostEvents({
                goToThread,
                channel,
                facepileRef: () => {},
            });

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
                            <ForumPostBody channel={channel} firstMessage={firstMessage} />
                            {firstMedia && <ForumPostMedia {...firstMedia} />}
                        </Flex>
                        <ForumPostFooter
                            channel={channel}
                            firstMessage={firstMessage}
                            containerWidth={width}
                        />
                    </Flex>
                </ErrorBoundary>
            );
        }
);
