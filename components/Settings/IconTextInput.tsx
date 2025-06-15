/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { parseUrl } from "@utils/misc";
import { Text, useCallback, useState } from "@webpack/common";

import { cl } from "../..";
import { useRichEditor } from "../../hooks";
import { ParsedEditorContent } from "../../hooks/useRichEditor";
import { CustomTag } from "../../types";
import { _memo } from "../../utils";
import { Icons } from "../icons";
import { defineRichEditorType, DraftType, Layout, RichEditor, ToolbarType } from "../RichEditor";

const type = defineRichEditorType({
    emojis: { button: true },
    drafts: { autoSave: false, type: DraftType.ChannelMessage },
    expressionPicker: { onlyEmojis: true },
    submit: { disableEnterToSubmit: true },
    users: { allowMentioning: false },
    layout: Layout.INLINE,
    toolbarType: ToolbarType.NONE,
    disableAutoFocus: true,
});

type Icon = Pick<CustomTag, "icon" | "emojiId" | "emojiName">;

interface IconTextInputProps {
    defaultValue?: string | null;
    onChange?: (icon: Icon) => void;
    modalKey?: string;
}

export const IconTextInput = _memo(function IconTextInput({
    defaultValue,
    onChange,
    modalKey,
}: IconTextInputProps) {
    const [error, setError] = useState(false);

    const handleChange = useCallback(
        ({ content, invalidEmojis, validNonShortcutEmojis }: ParsedEditorContent) => {
            const [emoji] = [...invalidEmojis, ...validNonShortcutEmojis];
            const icon: Icon = { icon: null, emojiId: null, emojiName: null };
            setError(false);

            switch (true) {
                case !!parseUrl(content): {
                    icon.icon = content;
                    break;
                }
                case !!emoji: {
                    if (emoji.type === 1) {
                        icon.emojiId = emoji.id;
                        icon.emojiName = emoji.name;
                    } else {
                        icon.emojiName = emoji.surrogates;
                    }
                    break;
                }
                default: {
                    setError(content.length > 0);
                }
            }

            onChange?.(icon);
        },
        [onChange]
    );

    const props = useRichEditor({ defaultValue, handleChange, type });

    return (
        <ErrorBoundary>
            <RichEditor
                className={cl("vc-better-forums-custom-input", {
                    "vc-better-forums-custom-input-error": error,
                })}
                placeholder="Enter image URL or emoji"
                allowNewLines={false}
                parentModalKey={modalKey}
                emojiPickerCloseOnModalOuterClick
                canMentionChannels={false}
                canMentionRoles={false}
                disableThemedBackground
                {...props}
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
