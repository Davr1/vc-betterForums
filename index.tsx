/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { LazyComponent } from "@utils/react";
import definePlugin from "@utils/types";
import { findByCodeLazy, findByPropsLazy, wreq } from "@webpack";
import {
    ChannelStore,
    Clickable,
    EmojiStore,
    Heading,
    i18n,
    React,
    RelationshipStore,
    Text,
    Timestamp,
    Tooltip,
    useEffect,
    useMemo,
    useRef,
    UserStore,
    useStateFromStores,
} from "@webpack/common";
import { Channel, Message } from "discord-types/general";
import { MouseEventHandler, ReactNode, Ref } from "react";

import {
    ChannelSectionStore,
    ChannelState,
    ForumChannelStore,
    ForumPostComposerStore,
    ForumPostMessagesStore,
    ForumSearchStore,
    GuildMemberRequesterStore,
    LayoutType,
    SortOrder,
    TagSetting,
    TypingStore,
} from "./stores";
import {
    CompareFn,
    deepEqual,
    useFormatTimestamp,
    useForumPostState,
    useMessageCount,
} from "./utils";

let getForumChannelStore: () => ForumChannelStore | null = () => null;

function useForumChannelState(channelId: Channel["id"]): ChannelState {
    const store = getForumChannelStore();
    const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId));

    return !channel || !store
        ? {
              layoutType: LayoutType.LIST,
              sortOrder: SortOrder.CREATION_DATE,
              tagFilter: new Set(),
              scrollPosition: 0,
              tagSetting: TagSetting.MATCH_SOME,
          }
        : store.getChannelState(channelId)!;
}

interface ComponentProps {
    className?: string;
    goToThread: (channel: Channel, _: boolean) => void;
    threadId: string;
    overrideMedia?: Record<string, unknown> | null;
    containerWidth: number;
}

const useFirstMessage: (channel: Channel) => { loaded: boolean; firstMessage: Message | null } =
    findByCodeLazy("loaded:", "firstMessage:", "getChannel", "getMessage");

const useFocusRing: () => { ref: Ref<unknown>; width: number; height: number } = findByCodeLazy(
    /,\{ref:\i,width:\i,height:\i\}\}/
);
const useForumPostComposerStore: <T>(
    selector: (store: ForumPostComposerStore) => T,
    compareFn: CompareFn
) => T = findByCodeLazy("[useForumPostComposerStore]", ")}");

const useForumPostEvents: (options: {
    facepileRef: Ref<unknown>;
    goToThread: ComponentProps["goToThread"];
    channel: Channel;
}) => {
    handleLeftClick: MouseEventHandler<unknown>;
    handleRightClick: MouseEventHandler<unknown>;
} = findByCodeLazy("facepileRef:", "handleLeftClick");

const classes = findByPropsLazy("obscuredThumbnailPlaceholder", "container"),
    classes2 = findByPropsLazy("slateBlockquoteContainer");

const useForumPostMetadata: (options: {
    firstMessage: Message | null;
    formatInline?: boolean;
    noStyleAndInteraction?: boolean;
}) => {
    hasSpoilerEmbeds: boolean;
    content: ReactNode | null;
    firstMedia: Record<string, unknown> | null;
    firstMediaIsEmbed: boolean;
} = findByCodeLazy(/noStyleAndInteraction:\i=!0\}/);
const idk3 = findByCodeLazy('type:"highlight"');
const MarkdownParser = findByCodeLazy("hideSimpleEmbedContent:", "1!==");
const ChannelComponent = findByCodeLazy("remainingTags:", "unsafe_rawColors");
const idk4 = findByCodeLazy("CHANNEL_PINNED_MESSAGE)");
const Idk5 = findByCodeLazy(".t.CSIeU1");
const idk6 = findByCodeLazy("isLurking:!1");
const Face = findByCodeLazy("this.defaultRenderUser", ".avatarContainerMasked");
const Typing = findByCodeLazy('"animate-always":"animate-never"');
const Idk7 = findByCodeLazy("getUserCombo(", "INTERACTIVE_NORMAL");

const cl = classNameFactory();

function ForumPost({
    className,
    goToThread,
    threadId,
    overrideMedia,
    containerWidth,
}: ComponentProps) {
    const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(threadId));
    const isOpen = useStateFromStores(
        [ChannelSectionStore],
        () => ChannelSectionStore.getCurrentSidebarChannelId(channel.parent_id) === channel.id
    );
    const { firstMessage } = useFirstMessage(channel);
    const { content, firstMedia } = useForumPostMetadata({ firstMessage });
    const media = overrideMedia ?? firstMedia;
    const { messageCountText: messageCount } = useMessageCount(channel);
    const { ref: ringTarget, height } = useFocusRing();
    const setCardHeight = useForumPostComposerStore((store) => store.setCardHeight, deepEqual);

    useEffect(() => {
        if (typeof height === "number") {
            setCardHeight(threadId, height);
        }
    }, [height, setCardHeight, threadId]);
    const facepileRef = useRef(null);

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
            className={cl(classes.container, className, {
                [classes.isOpen]: isOpen,
            })}
        >
            <Clickable
                onClick={handleLeftClick}
                focusProps={{
                    ringTarget,
                }}
                onContextMenu={handleRightClick}
                aria-label={i18n.intl.formatToPlainString(i18n.t.pgYN6e, {
                    title: channel.name,
                    count: messageCount,
                })}
                className={classes.focusTarget}
            />
            <div className={classes.left}>
                <Something
                    channel={channel}
                    firstMessage={firstMessage}
                    content={content}
                    hasMediaAttachment={media !== null}
                    containerWidth={containerWidth}
                ></Something>
                <ForumFooter
                    channel={channel}
                    firstMessage={firstMessage}
                    facepileRef={facepileRef}
                ></ForumFooter>
            </div>
        </div>
    );
}

interface ForumPostProps {
    message: Message;
    channel: Channel;
    content: string;
    hasMediaAttachment: boolean;
    hasUnreads: boolean;
}

const ForumPostBody = LazyComponent(() =>
    React.memo(function ForumPostBody({
        message,
        channel,
        content,
        hasMediaAttachment,
        hasUnreads,
    }: ForumPostProps) {
        const { isBlocked, isIgnored } = useStateFromStores([RelationshipStore], () => ({
            isBlocked: message && (RelationshipStore as any).isBlockedForMessage(message),
            isIgnored: message && (RelationshipStore as any).isIgnoredForMessage(message),
        }));

        const isLoading = useStateFromStores([ForumPostMessagesStore], () =>
            (ForumPostMessagesStore as any).isLoading(channel.id)
        );

        let component: ReactNode | null = null;

        if (isBlocked)
            component = (
                <Text
                    className={classes.blockedMessage}
                    variant="text-sm/medium"
                    color="text-muted"
                >
                    {i18n.intl.string(i18n.t.Lkp2fH)}
                </Text>
            );
        else if (isIgnored)
            component = (
                <Text
                    className={classes.blockedMessage}
                    variant="text-sm/medium"
                    color="text-muted"
                >
                    {i18n.intl.string(i18n.t.yWK7ZG)}
                </Text>
            );
        else {
            const { contentPlaceholder, renderedContent } =
                message == null
                    ? {
                          contentPlaceholder: null,
                          renderedContent: null,
                      }
                    : idk4(
                          message,
                          content,
                          isBlocked,
                          isIgnored,
                          cl(
                              classes.messageContent,
                              classes2.inlineFormat,
                              classes2.__invalid_smallFontSize
                          ),
                          {
                              leadingIconClass: classes.messageContentLeadingIcon,
                              trailingIconClass: classes.messageContentTrailingIcon,
                              iconSize: 20,
                          }
                      );

            component = renderedContent ? (
                <Text
                    variant="text-sm/semibold"
                    color={hasUnreads ? "header-secondary" : "text-muted"}
                >
                    {renderedContent}
                </Text>
            ) : hasMediaAttachment ? null : (
                <Text
                    tag="span"
                    variant="text-sm/medium"
                    color={hasUnreads ? "header-secondary" : "text-muted"}
                    className={classes.messageContent}
                >
                    {message == null
                        ? isLoading
                            ? null
                            : i18n.intl.string(i18n.t.mE3KJC)
                        : contentPlaceholder}
                </Text>
            );
        }

        return (
            <>
                {!isBlocked && (
                    <Idk5
                        channel={channel}
                        message={message}
                        renderColon={component}
                        hasUnreads={hasUnreads}
                    ></Idk5>
                )}
                <div className={classes.messageFocusBlock}>{component}</div>
            </>
        );
    })
);

function useTypingUsers(channelId: Channel["id"], limit: number = Number.MAX_SAFE_INTEGER) {
    return useStateFromStores(
        [UserStore, TypingStore, RelationshipStore],
        () => {
            const currentUserId = UserStore.getCurrentUser()?.id;
            const typingUsers = TypingStore.getTypingUsers(channelId);
            const users: string[] = [];
            for (const userId in typingUsers) {
                if (users.length >= limit) break;
                const user = UserStore.getUser(userId);
                if (
                    user &&
                    user.id !== currentUserId &&
                    !(RelationshipStore as any).isBlockedOrIgnored(user.id)
                )
                    users.push(user.id);
            }
            return users;
        },
        [channelId, limit]
    );
}

interface ForumFooterProps {
    channel: Channel;
    facepileRef: any;
    firstMessage: Message;
}

function ForumFooter({ channel, facepileRef, firstMessage }: ForumFooterProps) {
    const typingUsers = useTypingUsers(channel.id);
    const hasReactions = firstMessage?.reactions && firstMessage.reactions.length > 0;

    return (
        <div className={classes.footer}>
            {hasReactions || !firstMessage ? null : (
                <EmptyReaction firstMessage={firstMessage} channel={channel} />
            )}
            {!firstMessage ? null : <Reaction firstMessage={firstMessage} channel={channel} />}
            <Messages channel={channel} iconSize={14} />
            <span className={classes.bullet}>•</span>
            {typingUsers.length > 0 ? (
                <div className={classes.typing}>
                    <FacePile channel={channel} userIds={typingUsers} facepileRef={facepileRef} />
                    <div className={classes.dots}>
                        <Typing themed dotRadius={2}></Typing>
                    </div>
                    <Idk7 channel={channel} className={classes.typingUsers} renderDots={false} />
                </div>
            ) : (
                <Activity channel={channel} />
            )}
        </div>
    );
}

interface ActivityProps {
    channel: Channel;
}
function Activity({ channel }: ActivityProps) {
    const { sortOrder } = useForumChannelState(channel.parent_id);
    const children = useFormatTimestamp(channel, sortOrder);
    const createTimestamp = channel.threadMetadata?.createTimestamp; // TODO: different timestamp based on sortOrder

    return (
        <Tooltip text={<Timestamp timestamp={new Date(createTimestamp)} />}>
            {(props) => (
                <Text
                    className={classes.__invalid_activityText}
                    variant="text-sm/normal"
                    color="header-secondary"
                    {...props}
                >
                    {children}
                </Text>
            )}
        </Tooltip>
    );
}

interface FacePileProps {
    channel: Channel;
    userIds: string[];
    facepileRef: any;
}

function useUsers(channel: Channel, userIds: string[]) {
    const users = useStateFromStores([UserStore], () =>
        userIds.map((id) => UserStore.getUser(id)).filter(Boolean)
    );
    const ref = useRef(() => {
        users.forEach((user) => GuildMemberRequesterStore.requestMember(channel.guild_id, user.id));
    });
    useEffect(() => ref.current(), []);

    return users;
}

function FacePile({ channel, userIds, facepileRef }: FacePileProps) {
    const users = useUsers(channel, userIds);
    return (
        <div ref={facepileRef}>
            <Face
                className={classes.__invalid_facepile}
                showDefaultAvatarsForNullUsers={true}
                guildId={channel.getGuildId()}
                users={users}
                max={5}
                size={16}
                hideMoreUsers={true}
                showUserPopout={true}
            />
        </div>
    );
}

interface MessagesProps {
    channel: Channel;
    iconSize: number;
    showReadState?: boolean;
}

function Messages({ channel, iconSize, showReadState = false }: MessagesProps) {
    const { messageCountText, unreadCount } = useMessageCount(channel);
    return (
        <div
            className={cl(classes.messageCountBox, {
                [classes.hasRead]: showReadState && !unreadCount,
            })}
        >
            <span className={classes.messageCountIcon}>
                <span size="custom" color="currentColor" width={iconSize} height={iconSize}>
                    ICON
                </span>
            </span>
            <div className={classes.messageCountText}>{messageCountText}</div>
            {unreadCount !== null && (
                <Text
                    className={classes.newMessageCount}
                    variant="text-sm/semibold"
                    color="text-brand"
                >
                    {"(" +
                        i18n.intl.format(i18n.t.z3PEtr, {
                            count: unreadCount,
                        }) +
                        ")"}
                </Text>
            )}
        </div>
    );
}

function getDefaultEmoji(channel: Channel) {
    const emoji = (channel as any).defaultReactionEmoji;
    if (!emoji) return null;

    const customEmoji = useStateFromStores([EmojiStore], () =>
        EmojiStore.getUsableCustomEmojiById(emoji.emojiId)
    );

    if (emoji.emojiId && customEmoji)
        return {
            id: emoji.emojiId,
            name: customEmoji.name,
            animated: customEmoji.animated,
        };
    if (emoji.emojiName)
        return {
            id: emoji.emojiId,
            name: emoji.emojiName,
            animated: false,
        };

    return null;
}

interface ReactionProps {
    firstMessage: Message;
    channel: Channel;
}
function EmptyReaction({ firstMessage, channel }: ReactionProps) {
    const R = wreq(287151).le;

    const forumChannel = useStateFromStores([ChannelStore], () =>
        ChannelStore.getChannel(channel.parent_id)
    );
    const defaultEmoji = getDefaultEmoji(forumChannel);
    const { disableReactionCreates, isLurking, isPendingMember } = idk6(channel);

    if (!defaultEmoji || disableReactionCreates) return null;

    return (
        <R
            className={classes.updateReactionButton}
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

function Reaction({ firstMessage, channel }: ReactionProps) {
    const R = wreq(287151).le;

    const { disableReactionCreates, isLurking, isPendingMember } = idk6(channel);

    return firstMessage.reactions.map((reaction) => (
        <R
            className={classes.updateReactionButton}
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
        </R>
    ));
}

interface SomethingProps {
    channel: Channel;
    firstMessage: Message;
    content: string;
    hasMediaAttachment: boolean;
    containerWidth: number;
}

function Something({
    channel,
    firstMessage,
    content,
    hasMediaAttachment,
    containerWidth,
}: SomethingProps) {
    const { isNew, hasUnreads } = useForumPostState(channel);
    const channelName = useChannelName(channel);

    return (
        <div className={classes.body}>
            <ChannelComponent channel={channel} />
            <div className={classes.headerText}>
                <Heading
                    variant="heading-lg/semibold"
                    color={hasUnreads ? "header-primary" : "text-muted"}
                    lineClamp={2}
                    className={classes.postTitleText}
                >
                    <span>
                        {channelName}
                        {isNew && (
                            <span className={classes.newBadgeWrapper}>
                                <span className={classes.newBadge}>
                                    {i18n.intl.string(i18n.t.y2b7CA)}
                                </span>
                            </span>
                        )}
                    </span>
                </Heading>
            </div>
            <div className={classes.message}>
                <ForumPostBody
                    channel={channel}
                    message={firstMessage}
                    content={content}
                    hasMediaAttachment={hasMediaAttachment}
                    hasUnreads={hasUnreads}
                ></ForumPostBody>
            </div>
        </div>
    );
}

function useChannelName(channel: Channel) {
    const hasSearchResults = useStateFromStores([ForumSearchStore], () =>
        ForumSearchStore.getHasSearchResults(channel.parent_id)
    );

    const searchQuery = useStateFromStores([ForumSearchStore], () =>
        ForumSearchStore.getSearchQuery(channel.parent_id)
    );

    const postProcessor = useMemo(
        () => idk3(hasSearchResults && searchQuery != null ? searchQuery : ""),
        [hasSearchResults, searchQuery]
    );

    return React.useMemo(
        () => MarkdownParser({ content: channel.name, embeds: [] }, { postProcessor }).content,
        [channel.name, postProcessor]
    );
}

export default definePlugin({
    name: "BetterForums",
    description: "",
    authors: [],
    patches: [
        {
            find: ".getHasSearchResults",
            replacement: {
                match: /\.memo\(/,
                replace: ".memo($self.ForumPost??",
            },
        },
        {
            find: "this.toggleTagFilter",
            replacement: {
                match: /(\i)=(\i)\(\)/,
                replace: "$&;$self.forumOptions=$2",
            },
        },
    ],
    ForumPost,
    set forumOptions(value: () => ForumChannelStore) {
        getForumChannelStore = value;
    },
});
