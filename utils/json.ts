/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

type Input = string | null;
export type TextGetter = Input | (() => Promise<Input> | Input);

export async function parseJSON<T>(
    value: TextGetter,
    validate: (data: unknown) => void
): Promise<T | null> {
    try {
        const text = typeof value === "function" ? await value() : value;
        if (!text?.trim()) return null;

        const data = JSON.parse(text);
        validate(data);

        return data;
    } catch (error: unknown) {
        throw error instanceof Error ? error.message : `${error}`;
    }
}
