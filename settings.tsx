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

export const settings = definePluginSettings({
    keepState: {
        type: OptionType.BOOLEAN,
        description: "Keep forum state after reload",
        default: true,
        restartNeeded: true,
    },
    maxReactionCount: {
        type: OptionType.SLIDER,
        description: "Maximum number of reactions to show in the thread footer",
        default: 5,
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
    showThreadMembers: {
        type: OptionType.BOOLEAN,
        description: "Show members in the thread footer",
        default: true,
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
});
