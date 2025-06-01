/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { LazyComponent } from "@utils/lazyReact";
import { findByCodeLazy } from "@webpack";
import { ChannelStore, Clickable, useEffect, useRef, useStateFromStores } from "@webpack/common";
import { Channel, Message } from "discord-types/general";

import { cl } from "..";
import { ChannelSectionStore, ForumPostComposerStore } from "../stores";
import { CompareFn, deepEqual, ThreadChannel, useMessageCount } from "../utils";
import { ForumPostBody } from "./ForumPostBody";
import { ForumPostFooter } from "./ForumPostFooters";
import { Attachment, ForumPostMedia } from "./ForumPostMedia";

const useFirstMessage: (channel: Channel) => { loaded: boolean; firstMessage: Message | null } =
    findByCodeLazy("loaded:", "firstMessage:", "getChannel", "getMessage");

const useFocusRing: <T extends HTMLElement = HTMLElement>() => {
    ref: React.Ref<T>;
    width: number;
    height: number | null;
} = findByCodeLazy(/,\{ref:\i,width:\i,height:\i\}\}/);

const useForumPostComposerStore: <T>(
    selector: (store: ForumPostComposerStore) => T,
    compareFn: CompareFn
) => T = findByCodeLazy("[useForumPostComposerStore]", ")}");

const useForumPostEvents: (options: {
    facepileRef: React.Ref<HTMLElement>;
    goToThread: ForumPostProps["goToThread"];
    channel: Channel;
}) => {
    handleLeftClick: React.MouseEventHandler<unknown>;
    handleRightClick: React.MouseEventHandler<unknown>;
} = findByCodeLazy("facepileRef:", "handleLeftClick");

const useForumPostMetadata: (options: {
    firstMessage: Message | null;
    formatInline?: boolean;
    noStyleAndInteraction?: boolean;
}) => {
    hasSpoilerEmbeds: boolean;
    content: React.ReactNode | null;
    firstMedia: Attachment | null;
    firstMediaIsEmbed: boolean;
} = findByCodeLazy(/noStyleAndInteraction:\i=!0\}/);

interface ForumPostProps {
    className?: string;
    goToThread: (channel: Channel, _: boolean) => void;
    threadId: string;
}

export const ForumPost = LazyComponent(
    () =>
        function ForumPost({ className, goToThread, threadId }: ForumPostProps) {
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
            const { content, firstMedia } = useForumPostMetadata({ firstMessage });
            const { messageCountText: messageCount } = useMessageCount(channel);
            const { ref: ringTarget, height } = useFocusRing<HTMLDivElement>();
            const setCardHeight = useForumPostComposerStore(
                store => store.setCardHeight,
                deepEqual
            );

            useEffect(() => {
                if (typeof height === "number") {
                    setCardHeight(threadId, height);
                }
            }, [height, setCardHeight, threadId]);

            const facepileRef = useRef<HTMLDivElement>(null);

            const { handleLeftClick, handleRightClick } = useForumPostEvents({
                facepileRef,
                goToThread,
                channel,
            });

            return (
                <div
                    ref={ringTarget}
                    data-item-id={threadId}
                    onClick={handleLeftClick}
                    onContextMenu={handleRightClick}
                    className={cl("container", className, {
                        isOpen: isOpen,
                    })}
                >
                    <Clickable
                        onClick={handleLeftClick}
                        focusProps={{
                            ringTarget,
                        }}
                        onContextMenu={handleRightClick}
                        aria-label={getIntlMessage("FORUM_POST_ARIA_LABEL", {
                            title: channel.name,
                            count: messageCount,
                        })}
                        className={"focusTarget"}
                    />
                    <div className={"left"}>
                        <ForumPostBody
                            channel={channel}
                            firstMessage={firstMessage}
                            content={content}
                            hasMediaAttachment={firstMedia !== null}
                        />
                        <ForumPostFooter
                            channel={channel}
                            firstMessage={firstMessage}
                            facepileRef={facepileRef}
                        />
                    </div>
                    {firstMedia && <ForumPostMedia {...firstMedia} />}
                </div>
            );
        }
);
