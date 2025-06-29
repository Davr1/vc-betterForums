/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { makeRange } from "@components/PluginSettings/components";
import { getIntlMessage } from "@utils/discord";
import { OptionType } from "@utils/types";

import { TagSection } from "./components/Settings";
import { CustomTag } from "./types";

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
        componentProps: {
            onMarkerRender: (value: number) =>
                value === MaxTagCount.OFF
                    ? getIntlMessage("FORM_LABEL_OFF")
                    : value === MaxTagCount.ALL
                    ? getIntlMessage("FORM_LABEL_ALL")
                    : value,
        },
    },
    maxMediaCount: {
        type: OptionType.SLIDER,
        description:
            "Maximum number of media items (from attachments, embeds, or message components) to show at once",
        default: 3,
        markers: [MaxMediaCount.OFF, ...makeRange(1, 5), MaxMediaCount.ALL],
        stickToMarkers: true,
        componentProps: {
            onMarkerRender: (value: number) =>
                value === MaxMediaCount.OFF
                    ? getIntlMessage("FORM_LABEL_OFF")
                    : value === MaxMediaCount.ALL
                    ? getIntlMessage("FORM_LABEL_ALL")
                    : value,
        },
    },
    mediaSize: {
        type: OptionType.SLIDER,
        description: "Media preview size. Has no effect when Max Media Count is set to OFF.",
        default: 72,
        markers: [48, 56, 64, 72, 80, 96, 128],
        stickToMarkers: true,
        componentProps: {
            onMarkerRender: (value: number) => `${value}px`,
        },
    },
    messagePreviewLineCount: {
        type: OptionType.SLIDER,
        description: "Number of lines to show in the message preview",
        default: 3,
        markers: [...makeRange(1, 5), MessagePreviewLineCount.ALL],
        stickToMarkers: true,
        componentProps: {
            onMarkerRender: (value: number) =>
                value === MessagePreviewLineCount.ALL ? getIntlMessage("FORM_LABEL_ALL") : value,
        },
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
        componentProps: {
            onMarkerRender: (value: number) =>
                value === MaxReactionCount.OFF
                    ? getIntlMessage("FORM_LABEL_OFF")
                    : value === MaxReactionCount.ALL
                    ? getIntlMessage("FORM_LABEL_ALL")
                    : value,
        },
    },
    tagOverrides: {
        type: OptionType.COMPONENT,
        component: TagSection,
        default: {
            archived: { disabled: true },
        } as Record<CustomTag["id"], Partial<CustomTag>>,
    },
});
