/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Channel, Message, User } from "@vencord/discord-types";
import { findComponentByCodeLazy } from "@webpack";
import { ReactNode } from "react";

interface BadgeProps {
    message?: Message | null;
    channel?: Channel | null;
    user: User;
    compact?: boolean;
    isRepliedMessage?: boolean;
    hideIcon?: boolean;
    children?: ReactNode;
}

export const Badge = findComponentByCodeLazy<BadgeProps>("isVerifiedBot()", "isRepliedMessage");
