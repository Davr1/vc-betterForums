/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel } from "@vencord/discord-types";
import { findComponentByCodeLazy } from "@webpack";

export interface RichEditorProps {
    channel: Partial<Channel>;
    textValue?: string;
    richValue?: SlateNode[];
    className?: string;
    innerClassName?: string;
    editorClassName?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type: Partial<RichEditorType>;
    focused?: boolean;
    renderAttachButton?: boolean;
    renderApplicationCommandIcon?: boolean;
    renderAppLauncherButton?: boolean;
    renderAppCommandButton?: boolean;
    renderLeftAccessories?: boolean;
    onChange: (_a: unknown, textValue: string, richValue: SlateNode[]) => void;
    onSubmit?: (submitValue: {
        value: string;
    }) => Promise<Partial<{ shouldClear: boolean; shouldRefocus: boolean }>>;
    onFocus?: () => void;
    onBlur?: () => void;
    canMentionRoles?: boolean;
    canMentionChannels?: boolean;
    maxCharacterCount?: number;
    showRemainingCharsAfterCount?: boolean;
    allowNewLines?: boolean;
    characterCountClassName?: string;
    disableThemedBackground?: boolean;
    emojiPickerCloseOnModalOuterClick?: boolean;
    parentModalKey?: string;
}

export const RichEditor = findComponentByCodeLazy<RichEditorProps>('"chat input type must be set"');

export interface SlateNode {
    type: string;
    children: { text: string }[];
}

export enum Layout {
    DEFAULT = 0,
    INLINE = 1,
    FLUSH = 2,
}

export enum ToolbarType {
    TOOLTIP = 0,
    STATIC = 1,
    NONE = 2,
}

export enum DraftType {
    ChannelMessage = 0,
    ThreadSettings = 1,
    FirstThreadMessage = 2,
    ApplicationLauncherCommand = 3,
    Poll = 4,
    SlashCommand = 5,
    ForwardContextMessage = 6,
}

export interface RichEditorType {
    attachments: boolean;
    autocomplete: Partial<
        Record<
            "addReactionShortcut" | "forceChatLayer" | "reactions" | "alwaysUseLayer" | "small",
            boolean
        >
    >;
    commands: {
        enabled?: boolean;
    };
    confetti: RichEditorButton;
    drafts: {
        type?: DraftType;
        commandType?: DraftType;
        autoSave?: boolean;
    };
    emojis: RichEditorButton;
    gifs: RichEditorButton<"allowSending">;
    gifts: RichEditorButton;
    permissions: {
        requireSendMessages?: boolean;
        requireCreateTherads?: boolean; // not a typo
    };
    showThreadPromptOnReply: boolean;
    stickers: RichEditorButton<"allowSending" | "autoSuggest">;
    soundmoji: {
        allowSending?: boolean;
    };
    users: {
        allowMentioning?: boolean;
    };
    submit: RichEditorButton<
        | "ignorePreference"
        | "disableEnterToSubmit"
        | "clearOnSubmit"
        | "useDisabledStylesOnSubmit"
        | "allowEmptyMessage"
    >;
    uploadLongMessages: boolean;
    upsellLongMessages: {
        iconOnly?: boolean;
    };
    showCharacterCount: boolean;
    sedReplace: boolean;
    showSlowmodeIndicator: boolean;
    showTypingIndicator: boolean;
    toolbarType: ToolbarType;
    hideAccessoryBar: boolean;
    layout: Layout;
    disableAutoFocus: boolean;
    expressionPicker: {
        onlyEmojis?: boolean;
    };
    markdown: {
        disableCodeBlocks?: boolean;
        disableBlockQuotes?: boolean;
    };
    hideAttachmentArea: boolean;
}

type RichEditorButton<T extends string = string> = Partial<Record<T | "button", boolean>>;

export const defineRichEditorType = <T extends Partial<RichEditorType>>(type: T) => type;
