/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { Channel, TextProps, User } from "@vencord/discord-types";
import { Text, useMemo } from "@webpack/common";

import { useUsers } from "../hooks";
import { _memo } from "../utils";
import { Username } from "./Username";

const typingIntlKeys = Object.freeze({
    1: "ONE_USER_TYPING",
    2: "TWO_USERS_TYPING",
    3: "THREE_USERS_TYPING",
});
const defaultIntlKey = "SEVERAL_USERS_TYPING";

interface TypingTextProps extends TextProps {
    channel: Channel;
    userIds: User["id"][];
}

export const TypingText = _memo<TypingTextProps>(function TypingText({
    channel,
    userIds,
    ...props
}) {
    const users = useUsers(channel.getGuildId(), userIds);
    const usernames = useMemo(() => {
        const [a, b, c] = users.map(user => (
            <Username channel={channel} user={user} key={user.id} />
        ));
        return { a, b, c };
    }, [users]);

    const content = useMemo(() => {
        if (users.length === 0) return null;
        return getIntlMessage(typingIntlKeys[users.length] ?? defaultIntlKey, usernames);
    }, [users, usernames]);

    return (
        <Text variant="text-sm/normal" {...props}>
            {content}
        </Text>
    );
});
