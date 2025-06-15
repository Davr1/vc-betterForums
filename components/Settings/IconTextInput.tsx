/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { parseUrl } from "@utils/misc";
import { Text, useCallback, useRef, useState } from "@webpack/common";

import { cl } from "../..";
import { useRichEditor } from "../../hooks";
import { CustomTag, ParsedContent } from "../../types";
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

interface IconTextInputProps extends Icon {
    defaultValue?: Icon;
    onChange?: (icon: Icon) => void;
    modalKey?: string;
}

export const IconTextInput = _memo(function IconTextInput({
    icon,
    emojiId,
    emojiName,
    onChange,
    modalKey,
}: IconTextInputProps) {
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback(
        ({ content, invalidEmojis, validNonShortcutEmojis }: ParsedContent) => {
            const [emoji, ...rest] = [...invalidEmojis, ...validNonShortcutEmojis];
            const icon: Icon = { icon: null, emojiId: null, emojiName: null };
            setError(rest.length > 0 ? "Only one emoji can be specified" : null);

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
                case content.length > 0: {
                    setError("Invalid URL or emoji");
                }
            }

            onChange?.(icon);
        },
        [onChange]
    );

    // the input itself is uncontrolled in order to prevent rerenders with incorrect state
    // (after text is cleared with a cursor selection, the icon url is set to null
    // and replaced with an svg icon instead - this would override any pasted text
    // on the next render)
    const { current } = useRef(
        (typeof icon === "string" && icon.trim()) ||
            (emojiId ? `<:${emojiName}:${emojiId}>` : emojiName)
    );

    const props = useRichEditor({ defaultValue: current, handleChange, type });

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
                    <span>{error}</span>
                </Text>
            )}
        </ErrorBoundary>
    );
});
