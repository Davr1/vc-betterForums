/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { ErrorBoundary } from "@components/index";
import { makeRange } from "@components/PluginSettings/components";
import { getIntlMessage } from "@utils/discord";
import { Margins } from "@utils/margins";
import { OptionType } from "@utils/types";
import { Checkbox, Flex, Forms } from "@webpack/common";

import { cl } from ".";
import { Tag } from "./components/Tags";
import { CustomTagDefinition, Tag as TagType } from "./types";
import { tagDefinitions } from "./utils";

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

export enum ShowReplyPreview {
    NEVER,
    UNREADS_ONLY,
    FOLLOWED_ONLY,
    ALWAYS,
}

interface TagSettingProps {
    tag: TagType;
}

function TagSetting({ tag }: TagSettingProps) {
    const { customTags } = settings.use(["customTags"]);
    const value = customTags[tag.id];

    return (
        <Flex align={Flex.Align.CENTER} grow={0} className="vc-better-forums-tag-setting">
            <Checkbox
                value={value}
                onChange={(_, newValue) => (settings.store.customTags[tag.id] = newValue)}
                size={20}
            />
            <Tag tag={tag} className={cl({ "vc-better-forums-tag-disabled": !value })} />
        </Flex>
    );
}

const TagSettings = ErrorBoundary.wrap(() => {
    return (
        <Forms.FormSection>
            <Forms.FormTitle tag="h3">Custom tags</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                Custom tags provided by the plugin
            </Forms.FormText>
            <Flex justify={Flex.Justify.BETWEEN}>
                {Object.values(tagDefinitions as CustomTagDefinition[])
                    .map<TagType>(({ id, name, icon, color }) => ({
                        id,
                        name: typeof name === "function" ? name() : name,
                        icon: icon?.(),
                        custom: true,
                        color,
                    }))
                    .map(tag => (
                        <TagSetting tag={tag} key={tag.id} />
                    ))}
            </Flex>
        </Forms.FormSection>
    );
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
    customTags: {
        type: OptionType.COMPONENT,
        component: TagSettings,
        default: Object.fromEntries(Object.values(tagDefinitions).map(({ id }) => [id, true])),
    },
});
