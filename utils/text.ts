/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { parseUrl } from "@utils/misc";
import { findByCodeLazy } from "@webpack";

import { Host } from "./";

const replacements = Object.freeze({
    "-": "-",
    " ": " ",
    "[": " ",
    "]": " ",
    "(": " ",
    ")": " ",
    "|": " ",
    "~": " ",
    "\u200b": "",
    "\u200c": "",
    "\u200d": "",
    "\u200e": "",
    "\uFEFF": "",
});

const punctuationsRegex = /[\p{Pd}\p{Pc}\p{Po}]/gu;
const wwwRegex = /^www\./i;
const leadingSlashRegex = /^\//;

export function normalize(text: string): string {
    return [...text.toLowerCase()]
        .map(char => replacements[char] ?? (punctuationsRegex.test(char) ? " " : char))
        .join("")
        .trim();
}

// https://tartarus.org/martin/PorterStemmer/
const stemmer: (text: string) => string = findByCodeLazy("return 121===");

export function normalizeWord(text: string): string {
    return stemmer(
        text
            .replace(/('|\u2019|\uFF07)(s|S)$/, "")
            .toLowerCase()
            .trim()
    );
}

type HostAndPath = Record<"host" | "pathPrefix", string | null>;

export function getRemainingPath(
    { host, pathPrefix }: HostAndPath,
    url: URL | null
): string | null {
    if (!url || url.host.replace(wwwRegex, "") !== host) return null;

    const [path, prefix] = [url.pathname, pathPrefix ?? ""].map(s =>
        s.replace(leadingSlashRegex, "")
    );

    if (!path.startsWith(prefix)) return null;

    return path.substring(prefix.length) || null;
}

export function getHostAndPath(url: string): HostAndPath {
    if (url.startsWith("//")) url = `${location.protocol}${url}`;
    const parsedUrl = parseUrl(url);

    return {
        host: parsedUrl?.host ?? (url.startsWith("/") ? null : url),
        pathPrefix: parsedUrl?.pathname ?? (url.startsWith("/") ? url : null),
    };
}

export function matchesDiscordPath(target: string, regex: RegExp): boolean {
    const url = parseUrl(target);
    if (!url) return false;

    const primaryHostRemainingPath = Object.values(Host)
        .values()
        .map(getHostAndPath)
        .map(source => getRemainingPath(source, url))
        .find(Boolean);

    if (!primaryHostRemainingPath) return false;

    return regex.test(primaryHostRemainingPath);
}
