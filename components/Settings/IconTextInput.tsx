/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { parseUrl } from "@utils/misc";
import { Text, useCallback, useMemo, useState } from "@webpack/common";

import { cl } from "../..";
import { CustomTag } from "../../types";
import { _memo, dummyChannel, MessageParserUtils } from "../../utils";
import { DraftType, Layout, RichEditor, RichEditorType, ToolbarType } from "../EmojiPicker";
import { Icons } from "../icons";

const type: Partial<RichEditorType> = {
    emojis: { button: true },
    permissions: {
        requireCreateTherads: false,
        requireSendMessages: false,
    },
    drafts: {
        autoSave: false,
        type: DraftType.ChannelMessage,
    },
    expressionPicker: {
        onlyEmojis: true,
    },
    submit: {
        disableEnterToSubmit: true,
    },
    users: {
        allowMentioning: false,
    },
    layout: Layout.INLINE,
    toolbarType: ToolbarType.NONE,
    disableAutoFocus: true,
};

interface IconTextInputProps {
    defaultValue?: string | null;
    onChange?: (icon: Pick<CustomTag, "icon" | "emojiId" | "emojiName">) => void;
    modalKey?: string;
}

export const IconTextInput = _memo(function IconTextInput({
    defaultValue,
    onChange,
    modalKey,
}: IconTextInputProps) {
    const [error, setError] = useState(false);
    const [text, setText] = useState(defaultValue?.trim() || "");
    const richValue = useMemo(() => {
        return text.split("\n").map(line => ({ type: "line", children: [{ text: line }] }));
    }, [text]);

    const handleChange = useCallback(
        (_: unknown, value: string) => {
            setText(value);
            setError(false);
            if (!onChange) return;

            const { content, invalidEmojis, validNonShortcutEmojis } = MessageParserUtils.parse(
                dummyChannel,
                value.trim()
            );

            if (parseUrl(content)) return onChange({ icon: content });

            const [emoji] = [...invalidEmojis, ...validNonShortcutEmojis];
            if (emoji)
                return onChange({
                    icon: null,
                    emojiId: emoji.type === 1 ? emoji.id : null,
                    emojiName: emoji.type === 1 ? emoji.name : emoji.surrogates,
                });

            onChange({});
            setError(!!content && !emoji);
        },
        [onChange]
    );

    return (
        <ErrorBoundary>
            <RichEditor
                className={cl("vc-better-forums-custom-input", {
                    "vc-better-forums-custom-input-error": error,
                })}
                channel={dummyChannel}
                textValue={text}
                richValue={richValue}
                onChange={handleChange}
                placeholder="Enter image URL or emoji"
                allowNewLines={false}
                type={type}
                parentModalKey={modalKey}
                emojiPickerCloseOnModalOuterClick
                canMentionChannels={false}
                canMentionRoles={false}
                disableThemedBackground
            />
            {error && (
                <Text variant="text-sm/medium" className="vc-better-forums-error">
                    <Icons.Error />
                    <span>Invalid URL or emoji</span>
                </Text>
            )}
        </ErrorBoundary>
    );
});
