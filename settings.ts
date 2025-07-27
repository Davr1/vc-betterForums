/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { getIntlMessage } from "@utils/discord";
import { makeRange, OptionType } from "@utils/types";

import { TagSections } from "./components/Settings";
import { TagOverrides } from "./types";

export enum MaxReactionCount {
    OFF = 0,
    ALL = 10,
}

export enum MessagePreviewLineCount {
    ALL = 6,
}

export enum MaxTagCount {
    OFF = 0,
    ALL = 6,
}

export enum MaxMediaCount {
    OFF = 0,
    ALL = 6,
}

export enum ShowReplyPreview {
    NEVER,
    UNREADS_ONLY,
    FOLLOWED_ONLY,
    ALWAYS,
}

const sliderProps = ({
    formatFn = null,
    min = null,
    max = null,
}: {
    formatFn?: ((value: number) => string | number) | null;
    min?: number | null;
    max?: number | null;
}) => ({
    onMarkerRender: (value: number) => {
        if (min !== null && value <= min) return getIntlMessage("FORM_LABEL_OFF");
        if (max !== null && value >= max) return getIntlMessage("FORM_LABEL_ALL");

        return formatFn ? formatFn(value) : value;
    },
});

export const settings = definePluginSettings({
    keepState: {
        type: OptionType.BOOLEAN,
        description: "Keep forum state after reload",
        default: true,
        restartNeeded: true,
    },
    showFollowButton: {
        type: OptionType.BOOLEAN,
        description: "Show follow/unfollow button in the thread header",
        default: true,
    },
    maxTagCount: {
        type: OptionType.SLIDER,
        description: "Maximum number of tags to show in the thread header",
        default: 3,
        markers: [MaxTagCount.OFF, ...makeRange(1, 5), MaxTagCount.ALL],
        stickToMarkers: true,
        componentProps: sliderProps({ min: MaxTagCount.OFF, max: MaxTagCount.ALL }),
    },
    maxMediaCount: {
        type: OptionType.SLIDER,
        description:
            "Maximum number of media items (from attachments, embeds, or message components) to show at once",
        default: 3,
        markers: [MaxMediaCount.OFF, ...makeRange(1, 5), MaxMediaCount.ALL],
        stickToMarkers: true,
        componentProps: sliderProps({ min: MaxMediaCount.OFF, max: MaxMediaCount.ALL }),
    },
    mediaSize: {
        type: OptionType.SLIDER,
        description: "Media preview size. Has no effect when Max Media Count is set to OFF.",
        default: 72,
        markers: [48, 56, 64, 72, 80, 96, 128],
        stickToMarkers: true,
        componentProps: sliderProps({ formatFn: value => `${value}px` }),
    },
    messagePreviewLineCount: {
        type: OptionType.SLIDER,
        description: "Number of lines to show in the message preview",
        default: 3,
        markers: [...makeRange(1, 5), MessagePreviewLineCount.ALL],
        stickToMarkers: true,
        componentProps: sliderProps({ max: MessagePreviewLineCount.ALL }),
    },
    useExactCounts: {
        type: OptionType.BOOLEAN,
        description: "Don't round displayed numbers",
        default: false,
    },
    showThreadMembers: {
        type: OptionType.BOOLEAN,
        description: "Show members in the thread footer",
        default: true,
    },
    showReplyPreview: {
        type: OptionType.SELECT,
        description: "Show a preview of the latest message posted in a thread",
        options: [
            { label: "Always", value: ShowReplyPreview.ALWAYS },
            {
                label: "Only unread messages",
                value: ShowReplyPreview.UNREADS_ONLY,
                default: true,
            },
            {
                label: "All messages in followed threads only",
                value: ShowReplyPreview.FOLLOWED_ONLY,
            },
            { label: "Never", value: ShowReplyPreview.NEVER },
        ],
    },
    highlightNewMessages: {
        type: OptionType.BOOLEAN,
        description:
            "Highlights new messages with a blue border and background. Doesn't apply to muted threads.",
        default: false,
    },
    maxReactionCount: {
        type: OptionType.SLIDER,
        description: "Maximum number of reactions to show in the thread footer",
        default: 3,
        markers: [MaxReactionCount.OFF, ...makeRange(1, 9), MaxReactionCount.ALL],
        stickToMarkers: true,
        componentProps: sliderProps({ min: MaxReactionCount.OFF, max: MaxReactionCount.ALL }),
    },
    tagOverrides: {
        type: OptionType.COMPONENT,
        component: TagSections,
        default: {
            archived: { disabled: true },
        } as TagOverrides,
    },
});
