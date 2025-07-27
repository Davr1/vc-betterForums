/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CustomTag, Properties } from "../types";

function isRecord(obj: unknown): obj is Record<string, unknown> {
    return !!obj && typeof obj === "object" && !Array.isArray(obj);
}

export function validateTagOverrides(data: unknown): void {
    if (!isRecord(data)) {
        throw new Error("Root node must be a record");
    }

    Object.entries(data).forEach(([key, value]) => validateTagOverride(key, value));
}

function validateTagOverride(key: string, value: unknown): void {
    if (!isRecord(value)) {
        throw new Error(`Value must be a record (key: ${key})`);
    }

    validateStringProperties(key, value);
    validateBooleanProperties(key, value);
    validateNoInvalidProperties(key, value);
}

const stringProperties = [
    "id",
    "name",
    "info",
    "channelId",
    "emojiId",
    "emojiName",
    "color",
] satisfies Properties<CustomTag, string | null>[];

function validateStringProperties(key: string, value: Record<string, unknown>): void {
    stringProperties.forEach(prop => {
        if (prop in value && value[prop] && typeof value[prop] !== "string") {
            throw new Error(`${key}.${prop} must be a string`);
        }
    });
}

const booleanProperties = ["disabled", "invertedColor", "monochromeIcon"] satisfies Properties<
    CustomTag,
    boolean
>[];

function validateBooleanProperties(key: string, value: Record<string, unknown>): void {
    booleanProperties.forEach(prop => {
        if (prop in value && typeof value[prop] !== "boolean") {
            throw new Error(`${key}.${prop} must be a boolean`);
        }
    });
}

const invalidProperties = ["condition", "custom", "info"] satisfies Properties<CustomTag>[];

function validateNoInvalidProperties(key: string, value: Record<string, unknown>): void {
    invalidProperties.forEach(prop => {
        if (prop in value) {
            throw new Error(`${key}.${prop} is not allowed to be overriden`);
        }
    });
}
