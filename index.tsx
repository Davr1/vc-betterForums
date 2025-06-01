/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classNameFactory } from "@api/Styles";
import { getIntlMessage, getIntlMessageFromHash } from "@utils/discord";
import { LazyComponent } from "@utils/react";
import definePlugin from "@utils/types";
import { findByCodeLazy, findByPropsLazy } from "@webpack";
import {
    ChannelStore,
    Clickable,
    Heading,
    React,
    RelationshipStore,
    Text,
    Timestamp,
    Tooltip,
    useEffect,
    useRef,
    useStateFromStores,
    WindowStore,
} from "@webpack/common";
import { Channel, Message } from "discord-types/general";
import { MouseEventHandler, ReactNode, Ref } from "react";

import {
    ChannelSectionStore,
    ChannelState,
    ForumChannelStore,
    ForumPostComposerStore,
    ForumPostMessagesStore,
    LayoutType,
    SortOrder,
    TagSetting,
} from "./stores";
import {
    CompareFn,
    deepEqual,
    ForumChannel,
    useChannelName,
    useCheckPermissions,
    useDefaultEmoji,
    useFormatTimestamp,
    useForumPostState,
    useMessageCount,
    useTypingUsers,
    useUsers,
} from "./utils";

let getForumChannelStore: () => ForumChannelStore | null = () => null;
let ReactionButton: React.FC = () => <></>;

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

interface ForumPostProps {
    className?: string;
    goToThread: (channel: Channel, _: boolean) => void;
    threadId: string;
    containerWidth: number;
}

const useFirstMessage: (channel: Channel) => { loaded: boolean; firstMessage: Message | null } =
    findByCodeLazy("loaded:", "firstMessage:", "getChannel", "getMessage");

const useFocusRing: <T extends HTMLElement = HTMLElement>() => {
    ref: Ref<T>;
    width: number;
    height: number | null;
} = findByCodeLazy(/,\{ref:\i,width:\i,height:\i\}\}/);
const useForumPostComposerStore: <T>(
    selector: (store: ForumPostComposerStore) => T,
    compareFn: CompareFn
) => T = findByCodeLazy("[useForumPostComposerStore]", ")}");

const useForumPostEvents: (options: {
    facepileRef: Ref<HTMLElement>;
    goToThread: ForumPostProps["goToThread"];
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
const getMessageContent = findByCodeLazy("#{intl::MESSAGE_PINNED}");
const ForumPostUsername = findByCodeLazy("#{intl::FORUM_POST_AUTHOR_A11Y_LABEL}");
const FacePile = findByCodeLazy("this.props.renderIcon");
const TypingIndicator = findByCodeLazy('"animate-always":"animate-never"');
const TypingText = findByCodeLazy("getUserCombo(", "INTERACTIVE_NORMAL");
const MediaMosaic = findByCodeLazy("mediaMosaicAltTextPopoutDescription");

const cl = classNameFactory();

function ForumPost({ className, goToThread, threadId, containerWidth }: ForumPostProps) {
    const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(threadId));
    const isOpen = useStateFromStores(
        [ChannelSectionStore],
        () => ChannelSectionStore.getCurrentSidebarChannelId(channel.parent_id) === channel.id
    );
    const { firstMessage } = useFirstMessage(channel);
    const { content, firstMedia } = useForumPostMetadata({ firstMessage });
    const { messageCountText: messageCount } = useMessageCount(channel);
    const { ref: ringTarget, height } = useFocusRing<HTMLDivElement>();
    const setCardHeight = useForumPostComposerStore((store) => store.setCardHeight, deepEqual);

    useEffect(() => {
        if (typeof height === "number") {
            setCardHeight(threadId, height);
        }
    }, [height, setCardHeight, threadId]);
    const facepileRef = useRef<HTMLElement>(null);

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
                aria-label={getIntlMessage("FORUM_POST_ARIA_LABEL", {
                    title: channel.name,
                    count: messageCount,
                })}
                className={classes.focusTarget}
            />
            <div className={classes.left}>
                <ForumBody
                    channel={channel}
                    firstMessage={firstMessage}
                    content={content}
                    hasMediaAttachment={firstMedia !== null}
                    containerWidth={containerWidth}
                ></ForumBody>
                <ForumFooter
                    channel={channel}
                    firstMessage={firstMessage}
                    facepileRef={facepileRef}
                ></ForumFooter>
            </div>
            {firstMedia && <ForumPostMedia firstMedia={firstMedia} />}
        </div>
    );
}

function ForumPostMedia({ firstMedia }) {
    return (
        <div className={classes.bodyMedia} onClick={(e) => e.stopPropagation()}>
            <MediaEmbed firstMedia={firstMedia} />
        </div>
    );
}

function MediaEmbed({ firstMedia }) {
    const isFocused = useStateFromStores([WindowStore], () => WindowStore.isFocused());
    const { src, width, height, alt } = firstMedia;
    const isAnimated = !src || /\.(webp|gif|avif)$/i.test(src.split(/\?/, 1)[0]);

    return (
        <MediaMosaic
            src={src}
            width={width}
            height={height}
            minWidth={72}
            minHeight={72}
            alt={alt}
            animated={isAnimated && isFocused}
            srcIsAnimated={firstMedia.srcIsAnimated}
            containerClassName={classes.thumbnailContainer}
            imageClassName={cl(classes.thumbnailOverride)}
        />
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
                    {getIntlMessage("FORUM_POST_BLOCKED_FIRST_MESSAGE")}
                </Text>
            );
        else if (isIgnored)
            component = (
                <Text
                    className={classes.blockedMessage}
                    variant="text-sm/medium"
                    color="text-muted"
                >
                    {getIntlMessage("FORUM_POST_IGNORED_FIRST_MESSAGE")}
                </Text>
            );
        else {
            const { contentPlaceholder, renderedContent } = !message
                ? {
                      contentPlaceholder: null,
                      renderedContent: null,
                  }
                : getMessageContent(
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
                    {!message
                        ? isLoading
                            ? null
                            : getIntlMessageFromHash("mE3KJC")
                        : contentPlaceholder}
                </Text>
            );
        }

        return (
            <>
                {!isBlocked && (
                    <ForumPostUsername
                        channel={channel}
                        message={message}
                        renderColon={component}
                        hasUnreads={hasUnreads}
                    ></ForumPostUsername>
                )}
                <div className={classes.messageFocusBlock}>{component}</div>
            </>
        );
    })
);

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
                    <ActiveUsers
                        channel={channel}
                        userIds={typingUsers}
                        facepileRef={facepileRef}
                    />
                    <div className={classes.dots}>
                        <TypingIndicator themed dotRadius={2}></TypingIndicator>
                    </div>
                    <TypingText
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

interface ActiveUsersProps {
    channel: Channel;
    userIds: string[];
    facepileRef: any;
}

function ActiveUsers({ channel, userIds, facepileRef }: ActiveUsersProps) {
    const users = useUsers(channel, userIds);
    return (
        <div ref={facepileRef}>
            <FacePile
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
                        getIntlMessage("CHANNEL_NEW_POSTS_LABEL", {
                            count: unreadCount,
                        }) +
                        ")"}
                </Text>
            )}
        </div>
    );
}

interface ReactionProps {
    firstMessage: Message;
    channel: Channel;
}
function EmptyReaction({ firstMessage, channel }: ReactionProps) {
    const forumChannel = useStateFromStores(
        [ChannelStore],
        () => ChannelStore.getChannel(channel.parent_id) as ForumChannel
    );
    const defaultEmoji = useDefaultEmoji(forumChannel);
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);

    if (!defaultEmoji || disableReactionCreates) return null;

    return (
        <ReactionButton
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
    const { disableReactionCreates, isLurking, isPendingMember } = useCheckPermissions(channel);

    return firstMessage.reactions.map((reaction) => (
        <ReactionButton
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
        </ReactionButton>
    ));
}

interface ForumBodyProps {
    channel: Channel;
    firstMessage: Message;
    content: string;
    hasMediaAttachment: boolean;
    containerWidth: number;
}

function ForumBody({
    channel,
    firstMessage,
    content,
    hasMediaAttachment,
    containerWidth,
}: ForumBodyProps) {
    const { isNew, hasUnreads } = useForumPostState(channel);
    const channelName = useChannelName(channel);

    return (
        <div className={classes.body}>
            <ForumPostHeader channel={channel} />
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
                                    {getIntlMessageFromHash("y2b7CA")}
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

function useTags(channel: Channel) {
    return useStateFromStores([ChannelStore], () => {
        const availableTags = (
            ChannelStore.getChannel(channel.parent_id)?.availableTags ?? []
        ).reduce((acc, tag) => {
            acc[tag.id] = tag;
            return acc;
        }, {});
        return (channel.appliedTags ?? []).map((tag) => availableTags[tag]);
    });
}

function useForumPostInfo({ channel, isNew }) {
    const appliedTags = useTags(channel);
    const shownTags = appliedTags.slice(undefined, 3);
    const remainingTags = appliedTags.slice(3);
    const moreTagsCount = appliedTags.length > 3 ? appliedTags.length - 3 : 0;
    const isPinned = channel.hasFlag(2);
    const shouldRenderTagsRow = shownTags.length > 0 || isPinned || isNew;
    return {
        shownTags,
        remainingTags,
        moreTagsCount,
        isPinned,
        shouldRenderTagsRow,
        forumPostContainsTags: appliedTags.length > 0,
    };
}

function Tag({ tag: { name }, className, selected }) {
    return (
        <div className={className}>
            <Text variant="text-xs/semibold" lineClamp={1} color="currentColor">
                {name}
            </Text>
        </div>
    );
}

function MoreTags({ tags, count, size = 1 }) {
    return (
        <Tooltip
            text={tags.map((tag) => (
                <Tag tag={tag} key={tag.id} />
            ))}
        >
            {(props) => (
                <div {...props}>
                    <Text variant="text-xs/semibold">+{count}</Text>
                </div>
            )}
        </Tooltip>
    );
}

function ForumPostHeader({ channel, isNew, tagsClassName, className }: { channel: Channel }) {
    const { shownTags, remainingTags, moreTagsCount, isPinned, shouldRenderTagsRow } =
        useForumPostInfo({
            channel,
            isNew,
        });
    const { tagFilter } = useForumChannelState(channel.id);
    if (!shouldRenderTagsRow) return null;

    return (
        <div className={cl("tags", className)}>
            {isNew ? "new" : ""}
            {isPinned ? "pinned" : ""}
            {shownTags.map((tag) => (
                <Tag
                    tag={tag}
                    className={cl(tagsClassName, { filtered: tagFilter.has(tag.id) })}
                    key={tag.id}
                    selected
                />
            ))}
            {moreTagsCount > 0 && <MoreTags tags={remainingTags} count={moreTagsCount} size={0} />}
        </div>
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
        {
            find: "this.userCanBurstReact",
            replacement: {
                match: /(\i)=(\i)\.memo/,
                replace: "$1=$self.ReactionButton=$2.memo",
            },
        },
    ],
    ForumPost,
    set forumOptions(value: () => ForumChannelStore) {
        getForumChannelStore = value;
    },
    set ReactionButton(value: React.FC) {
        ReactionButton = value;
    },
});
