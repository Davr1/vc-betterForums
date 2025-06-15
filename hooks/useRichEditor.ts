/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";

import { RichEditorProps, RichEditorType } from "../components/RichEditor";
import { ParsedContent } from "../types";
import { dummyChannel, MessageParserUtils } from "../utils";

type Submit = Partial<{ shouldClear: boolean; shouldRefocus: boolean }> | void;

interface Options {
    defaultValue?: string | null;
    handleChange?: (value: ParsedContent) => void;
    handleSubmit?: (value: ParsedContent) => Submit | Promise<Submit>;
    type?: Partial<RichEditorType>;
}

function parse(value: string): ParsedContent {
    return MessageParserUtils.parse(dummyChannel, value.trim());
}

export function useRichEditor({ defaultValue = "", handleChange, handleSubmit, type }: Options) {
    return useMemo(() => {
        const textValue = defaultValue ?? "";
        const richValue = textValue
            .split("\n")
            .map(line => ({ type: "line", children: [{ text: line }] }));

        const onChange: RichEditorProps["onChange"] = (_, value) => handleChange?.(parse(value));
        const onSubmit: RichEditorProps["onSubmit"] = ({ value }) =>
            (async () => {
                const submit = await handleSubmit?.(parse(value));
                return { ...submit, shouldClear: false, shouldRefocus: false };
            })();

        return {
            textValue,
            richValue,
            onChange,
            onSubmit,
            channel: dummyChannel,
            type: { permissions: {}, drafts: {}, ...type }, // some options are required
        } as const satisfies Partial<RichEditorProps>;
    }, [defaultValue, handleChange, type]);
}
