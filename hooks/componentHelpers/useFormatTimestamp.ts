/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { runtimeHashMessageKey } from "@utils/intlHash";
import { Channel } from "@vencord/discord-types";
import { findByCodeLazy } from "@webpack";
import { i18n, SnowflakeUtils, useMemo } from "@webpack/common";

import { Duration, ReadStateStore, SortOrder } from "../../stores";
import { TimeFormatterOptions } from "../../types";

// TODO: rewrite
const timeFormatter: (timestamp: number | null, options?: () => TimeFormatterOptions) => string =
    findByCodeLazy('"minutes",1');

const timeFormat = () =>
    ({
        minutes: i18n.t[runtimeHashMessageKey("FORM_POST_CREATED_AGO_TIMESTAMP_MINUTES")],
        hours: i18n.t[runtimeHashMessageKey("FORM_POST_CREATED_AGO_TIMESTAMP_HOURS")],
        days: i18n.t[runtimeHashMessageKey("FORM_POST_CREATED_AGO_TIMESTAMP_DAYS")],
        month: getIntlMessage("FORM_POST_CREATED_AGO_TIMESTAMP_MORE_THAN_MONTH"),
    } as const satisfies TimeFormatterOptions);

export function useFormatTimestamp(
    channel: Channel,
    sortOrder: SortOrder,
    duration: Duration = Duration.DURATION_AGO
): string {
    const timestamp = useMemo(() => SnowflakeUtils.extractTimestamp(channel.id), [channel.id]);

    const lastMessage = ReadStateStore.use($ => $.lastMessageId(channel.id), [channel.id]);

    const lastMessageTimestamp = useMemo(
        () => (lastMessage ? SnowflakeUtils.extractTimestamp(lastMessage) : timestamp),
        [lastMessage, timestamp]
    );

    const targetTimestamp = useMemo(
        () => (sortOrder === SortOrder.CREATION_DATE ? timestamp : lastMessageTimestamp),
        [lastMessageTimestamp, sortOrder, timestamp]
    );

    const format = useMemo(() => {
        if (sortOrder === SortOrder.CREATION_DATE && duration === Duration.POSTED_DURATION_AGO)
            return timeFormat;
    }, [sortOrder, duration]);

    return useMemo(() => timeFormatter(targetTimestamp, format), [targetTimestamp, format]);
}
