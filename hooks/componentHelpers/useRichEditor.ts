/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useCallback, useMemo, useRef, useState } from "@webpack/common";

import { DraftType, RichEditorProps, SlateNode } from "../../components/RichEditor";
import { ParsedContent, RichEditorOptions } from "../../types";
import { dummyChannel, MessageParserUtils } from "../../utils";

function parse(value: string): ParsedContent {
    return MessageParserUtils.parse(dummyChannel, value.trim());
}

function toRichValue(value: string): SlateNode[] {
    return value.split("\n").map(line => ({ type: "line", children: [{ text: line }] }));
}

export function useRichEditor({
    defaultValue,
    handleChange,
    handleSubmit,
    type,
}: RichEditorOptions) {
    // this isn't really required, but it prevents flashing during typing
    const focused = useRef<boolean>(false);

    const onFocus = useCallback(() => {
        focused.current = true;
    }, []);
    const onBlur = useCallback(() => {
        focused.current = false;
    }, []);

    // controlled input is required for autocomplete
    const [textValue, setTextValue] = useState<string>(defaultValue ?? "");
    const [richValue, setRichValue] = useState<SlateNode[]>(() => toRichValue(textValue));

    const onChange: RichEditorProps["onChange"] = useCallback(
        (_, value, richValue) => {
            if (value === textValue) return;

            setTextValue(value);
            setRichValue(richValue);
            handleChange?.(parse(value));
        },
        [handleChange, textValue]
    );

    const onSubmit: RichEditorProps["onSubmit"] = useCallback(
        ({ value }) =>
            (async () => {
                const submit = await handleSubmit?.(parse(value));
                return { ...submit, shouldClear: false, shouldRefocus: false };
            })(),
        [handleSubmit]
    );

    const fullType = useMemo(
        () => ({
            permissions: { requireCreateTherads: false, requireSendMessages: false },
            drafts: { type: DraftType.ChannelMessage },
            ...type,
        }), // some options are required
        [type]
    );

    return {
        textValue,
        richValue,
        onChange,
        onSubmit,
        channel: dummyChannel,
        type: fullType,
        focused: focused.current,
        onFocus,
        onBlur,
    } as const satisfies Partial<RichEditorProps>;
}
