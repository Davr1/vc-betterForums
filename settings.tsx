/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { makeRange } from "@components/PluginSettings/components";
import { getIntlMessage } from "@utils/discord";
import { OptionType } from "@utils/types";

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
        min: 1,
        max: 6,
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
    messagePreviewLineCount: {
        type: OptionType.SLIDER,
        description: "Number of lines to show in the message preview",
        default: 3,
        min: 1,
        max: 6,
        markers: [...makeRange(1, 5), MessagePreviewLineCount.ALL],
        stickToMarkers: true,
        componentProps: {
            onMarkerRender: (value: number) =>
                value === MessagePreviewLineCount.ALL ? getIntlMessage("FORM_LABEL_ALL") : value,
        },
    },
    showThreadMembers: {
        type: OptionType.BOOLEAN,
        description: "Show members in the thread footer",
        default: true,
    },
    showReplyPreview: {
        type: OptionType.BOOLEAN,
        description: "Show a preview of the latest thread reply in active threads",
        default: true,
    },
    maxReactionCount: {
        type: OptionType.SLIDER,
        description: "Maximum number of reactions to show in the thread footer",
        default: 3,
        min: MaxReactionCount.OFF,
        max: MaxReactionCount.ALL,
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
});
