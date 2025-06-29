/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useMemo } from "@webpack/common";

import { CustomTag } from "../../types";
import { tagDefinitions } from "../../utils";

export function useAllCustomTags(): Map<CustomTag["id"], CustomTag> {
    return useMemo(() => new Map(tagDefinitions.map(tag => [tag.id, tag])), []);
}
