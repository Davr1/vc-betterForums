/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByCodeLazy } from "@webpack";

import { ForumPostComposerStore } from "../../stores";

export const useForumPostComposerStore: <T>(
    selector: (store: ForumPostComposerStore) => T,
    compareFn?: (a: unknown, b: unknown) => boolean
) => T = findByCodeLazy("[useForumPostComposerStore]", ")}");
