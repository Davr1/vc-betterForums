/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { LazyComponent } from "@utils/react";
import definePlugin from "@utils/types";
import { findByCodeLazy, findByPropsLazy, findStoreLazy, wreq } from "@webpack";
import {
    ChannelStore,
    EmojiStore,
    GuildStore,
    Heading,
    i18n,
    PermissionStore,
    React,
    ReadStateStore,
    RelationshipStore,
    SnowflakeUtils,
    Text,
    Timestamp,
    Tooltip,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    UserStore,
    useState,
    useStateFromStores,
} from "@webpack/common";
import { Channel, Guild, Message } from "discord-types/general";
import { ReactNode } from "react";

let forumOptions: () => {
    getChannelState: (id: string) => unknown;
} | null = () => null;

enum LayoutType {
    DEFAULT = 0,
    LIST = 1,
    GRID = 2,
}
enum SortOrder {
    LATEST_ACTIVITY = 0,
    CREATION_DATE = 1,
}
enum TagSetting {
    MATCH_SOME = "match_some",
    MATCH_ALL = "match_all",
}
enum Duration {
    DURATION_AGO = 0,
    POSTED_DURATION_AGO = 1,
}

function useForumOptions(channelId: string) {
    const options = forumOptions();
    const channel = useStateFromStores([ChannelStore], () =>
        ChannelStore.getChannel(channelId)
    );

    return !channel || !options
        ? {
              layoutType: LayoutType.LIST,
              sortOrder: SortOrder.CREATION_DATE,
              tagFilter: new Set(),
              scrollPosition: 0,
              tagSetting: TagSetting.MATCH_SOME,
          }
        : options.getChannelState(channelId);
}

interface ComponentProps {
    className?: string;
    goToThread: (channel: Channel, _: boolean) => void;
    threadId: string;
    overrideMedia?: unknown;
    containerWidth: number;
}

const ChannelSectionStore: {
    getCurrentSidebarChannelId: (id: string) => string;
} = findStoreLazy("ChannelSectionStore");
const ForumPostMessagesStore: {
    getMessage: (id: string) => {
        loaded: boolean;
        firstMessage: Message | null;
    };
} = findStoreLazy("ForumPostMessagesStore");
const ThreadMessageStore = findStoreLazy("ThreadMessageStore");
const ForumPostUnreadCountStore = findStoreLazy("ForumPostUnreadCountStore");
const GuildMemberRequesterStore = findStoreLazy("GuildMemberRequesterStore");
const TypingStore = findStoreLazy("TypingStore");
const getMessageCount = findByCodeLazy("isMaxMessageCount:");
const getFirstMessage = findByCodeLazy(
    "loaded:",
    "firstMessage:",
    "getChannel",
    "getMessage"
);
const useRing = findByCodeLazy(/,\{ref:\i,width:\i,height:\i\}\}/);
const useForumPostComposerStore = findByCodeLazy(
    "[useForumPostComposerStore]",
    ")}"
);
const deepEqual = findByCodeLazy("!!Object.is");
const facePileEvents = findByCodeLazy("facepileRef:", "handleLeftClick");
const idk = findByCodeLazy(
    "useLayoutEffect(",
    'role:"listitem"',
    "useState(-1)"
);
const classes = findByPropsLazy("obscuredThumbnailPlaceholder", "container"),
    classes2 = findByPropsLazy("slateBlockquoteContainer");
const Ring = findByCodeLazy("renderNonInteractive()");
const C2 = findByCodeLazy(/className:\i,enabled:\i=!0}=\i/);
const idk2 = findByCodeLazy(/noStyleAndInteraction:\i=!0\}/);
const ForumSearchStore = findStoreLazy("ForumSearchStore");
const idk3 = findByCodeLazy('type:"highlight"');
const MarkdownParser = findByCodeLazy("hideSimpleEmbedContent:", "1!==");
const ChannelComponent = findByCodeLazy("remainingTags:", "unsafe_rawColors");
const idk4 = findByCodeLazy("CHANNEL_PINNED_MESSAGE)");
const Idk5 = findByCodeLazy(".t.CSIeU1");
const idk6 = findByCodeLazy("isLurking:!1");
const Face = findByCodeLazy("this.defaultRenderUser", ".avatarContainerMasked");
const Typing = findByCodeLazy('"animate-always":"animate-never"');
const Idk7 = findByCodeLazy("getUserCombo(", "INTERACTIVE_NORMAL");
const timeFormatter = findByCodeLazy('"minutes",1');

function useIdk(channel: Channel) {
    return useStateFromStores([GuildStore, ReadStateStore], () => {
        const guild: Guild | null = GuildStore.getGuild(channel.getGuildId());
        return {
            isNew:
                !!guild &&
                !channel.isArchivedThread() &&
                ReadStateStore.isNewForumThread(
                    channel.id,
                    channel.parent_id,
                    guild
                ),
            hasUnreads:
                !!guild &&
                !channel.isArchivedThread() &&
                ReadStateStore.isForumPostUnread(channel.id),
        };
    });
}

function useFocus<T>(callback: (data: T) => void) {
    const [isFocused, setIsFocused] = useState(false);

    return {
        isFocused,
        handleFocus: useCallback(
            (data: T) => {
                callback(data);
                setIsFocused(true);
            },
            [callback, setIsFocused]
        ),
        handleBlur: () => setIsFocused(false),
    };
}

const cl = classNameFactory();

function ForumPost({
    className,
    goToThread,
    threadId,
    overrideMedia,
    containerWidth,
}: ComponentProps) {
    const channel = useStateFromStores([ChannelStore], () =>
        ChannelStore.getChannel(threadId)
    );
    const isOpen = useStateFromStores(
        [ChannelSectionStore],
        () =>
            ChannelSectionStore.getCurrentSidebarChannelId(
                channel.parent_id
            ) === channel.id
    );
    const { firstMessage } = getFirstMessage(channel);
    const { content, firstMedia } = idk2({ firstMessage });
    const media = overrideMedia ?? firstMedia;
    const { messageCountText: messageCount } = getMessageCount(channel);
    const { ref: ringTarget, height } = useRing();
    const setCardHeight = useForumPostComposerStore(
        (x) => x.setCardHeight,
        deepEqual
    );

    useEffect(() => {
        if (typeof height === "number") {
            setCardHeight(threadId, height);
        }
    }, [height, setCardHeight, threadId]);
    const facepileRef = useRef(null);

    const { handleLeftClick, handleRightClick } = facePileEvents({
        facepileRef,
        goToThread,
        channel,
    });

    const { role, onFocus, ...rest } = idk(threadId);
    const { isFocused, handleFocus, handleBlur } = useFocus(onFocus);

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
            <Ring
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
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...rest}
            />
            <div className={classes.left}>
                <Something
                    channel={channel}
                    firstMessage={firstMessage}
                    content={content}
                    hasMediaAttachment={media !== null}
                    containerWidth={containerWidth}
                ></Something>
                <C2 enabled={!isFocused}>
                    <ForumFooter
                        channel={channel}
                        firstMessage={firstMessage}
                        facepileRef={facepileRef}
                    ></ForumFooter>
                </C2>
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
        const { isBlocked, isIgnored } = useStateFromStores(
            [RelationshipStore],
            () => ({
                isBlocked:
                    message &&
                    (RelationshipStore as any).isBlockedForMessage(message),
                isIgnored:
                    message &&
                    (RelationshipStore as any).isIgnoredForMessage(message),
            })
        );

        const isLoading = useStateFromStores([ForumPostMessagesStore], () =>
            (ForumPostMessagesStore as any).isLoading(channel.id)
        );

        const canManageMessages = useStateFromStores([PermissionStore], () =>
            PermissionStore.can(8192n, channel)
        );

        const renderSpoilers = wreq(695346).cC.useSetting();
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
                              leadingIconClass:
                                  classes.messageContentLeadingIcon,
                              trailingIconClass:
                                  classes.messageContentTrailingIcon,
                              iconSize: 20,
                          }
                      );

            component =
                renderedContent != null ? (
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
                <C2 clasName={classes.messageFocusBlock}>{component}</C2>
            </>
        );
    })
);

function useTypingUsers(
    channel: Channel,
    limit: number = Number.MAX_SAFE_INTEGER
) {
    return useStateFromStores(
        [UserStore, TypingStore, RelationshipStore],
        () => {
            const currentUserId = UserStore.getCurrentUser()?.id;
            const typingUsers = TypingStore.getTypingUsers(channel);
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
        [channel, limit]
    );
}

interface ForumFooterProps {
    channel: Channel;
    facepileRef: any;
    firstMessage: Message;
}

function ForumFooter({ channel, facepileRef, firstMessage }: ForumFooterProps) {
    const typingUsers = useTypingUsers(channel);
    const hasReactions =
        firstMessage?.reactions && firstMessage.reactions.length > 0;

    return (
        <div className={classes.footer}>
            {hasReactions || !firstMessage ? null : (
                <EmptyReaction firstMessage={firstMessage} channel={channel} />
            )}
            {!firstMessage ? null : (
                <Reaction firstMessage={firstMessage} channel={channel} />
            )}
            <Messages channel={channel} iconSize={14} />
            <span className={classes.bullet}>•</span>
            {typingUsers.length > 0 ? (
                <div className={classes.typing}>
                    <FacePile
                        channel={channel}
                        userIds={typingUsers}
                        facepileRef={facepileRef}
                    />
                    <div className={classes.dots}>
                        <Typing themed dotRadius={2}></Typing>
                    </div>
                    <Idk7
                        channel={channel}
                        className={classes.typingUsers}
                        renderDots={false}
                    />
                </div>
            ) : (
                <Activity channel={channel} />
            )}
        </div>
    );
}

function useFormatTimestamp(
    channel: Channel,
    sortOrder: SortOrder,
    duration: Duration = Duration.DURATION_AGO
) {
    const timestamp = useMemo(
        () => sortOrder === SnowflakeUtils.extractTimestamp(channel.id),
        [channel.id]
    );
    const lastMessage = useStateFromStores([ReadStateStore], () =>
        ReadStateStore.lastMessageId(channel.id)
    );
    const lastMessageTimestamp = useMemo(
        () =>
            (lastMessage && SnowflakeUtils.extractTimestamp(lastMessage)) ??
            timestamp,
        [lastMessage, timestamp]
    );

    const format = useMemo(
        () => () => ({
            minutes: i18n.t.nFt9cn,
            hours: i18n.t.jzCewc,
            days: i18n.t.U4I0s7,
            month: i18n.intl.string(i18n.t["nBNJ/P"]),
        }),
        [sortOrder, duration]
    );
    console.log(format);

    return useMemo(
        () =>
            sortOrder === SortOrder.CREATION_DATE
                ? timeFormatter(timestamp, format)
                : timeFormatter(lastMessageTimestamp, format),
        [format, lastMessageTimestamp, timestamp, sortOrder]
    );
}

interface ActivityProps {
    channel: Channel;
}
function Activity({ channel }: ActivityProps) {
    const { sortOrder } = useForumOptions(channel.parent_id);
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
        users.forEach((user) =>
            GuildMemberRequesterStore.requestMember(channel.guild_id, user.id)
        );
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

function formatMessageCount(count: number) {
    count = Math.max(0, count);
    return count >= 50 ? "50+" : count >= 1e5 ? "100k+" : `${count}`;
}

function useMessageCount(channel: Channel) {
    const messageCount = useStateFromStores(
        [ThreadMessageStore],
        () => ThreadMessageStore.getCount(channel.id) ?? 0
    );
    const messageCountText = formatMessageCount(messageCount);
    const unread = useStateFromStores(
        [ReadStateStore],
        () =>
            ReadStateStore.hasTrackedUnread(channel.id) &&
            ReadStateStore.hasOpenedThread(channel.id) &&
            !!ReadStateStore.getTrackedAckMessageId(channel.id)
    );

    const unreadCount = useStateFromStores([ForumPostUnreadCountStore], () => {
        if (!unread) return null;

        const count = ForumPostUnreadCountStore.getCount(channel.id);
        if (!count) return "1+";

        const realCount = Math.min(count, messageCount);
        return realCount >= 25 ? "25+" : realCount;
    });

    return {
        messageCount,
        isMaxMessageCount:
            messageCount && `${messageCount}` !== messageCountText,
        messageCountText,
        unreadCount,
    };
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
                <span
                    size="custom"
                    color="currentColor"
                    width={iconSize}
                    height={iconSize}
                >
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
    const { disableReactionCreates, isLurking, isPendingMember } =
        idk6(channel);

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

    const { disableReactionCreates, isLurking, isPendingMember } =
        idk6(channel);

    return firstMessage.reactions.map((reaction) => (
        <R
            className={classes.updateReactionButton}
            message={firstMessage}
            readOnly={
                disableReactionCreates ||
                (channel as any).isArchivedLockedThread()
            }
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
    const { isNew, hasUnreads } = useIdk(channel);
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
        () =>
            MarkdownParser(
                { content: channel.name, embeds: [] },
                { postProcessor }
            ).content,
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
    set forumOptions(value) {
        forumOptions = value;
    },
});
