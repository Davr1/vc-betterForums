/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BaseText } from "@components/BaseText";
import { getIntlMessage } from "@utils/discord";
import { Tooltip, useCallback } from "@webpack/common";

import { ThreadChannel } from "userplugins/betterForums/types";
import { cl } from "../..";
import { _memo, ThreadActions } from "../../utils";
import { Icons } from "../icons";

interface FollowButtonProps {
    hasJoined?: boolean;
    channel: ThreadChannel;
}

export const FollowButton = _memo<FollowButtonProps>(function FollowButton({
    hasJoined = false,
    channel,
}) {
    const Icon = hasJoined ? Icons.Tick : Icons.Bell;
    const intlKey = hasJoined ? "FORUM_UNFOLLOW_BUTTON" : "FORUM_FOLLOW_BUTTON";

    const followAction = useCallback(
        () => (hasJoined ? ThreadActions.leaveThread(channel) : ThreadActions.joinThread(channel)),
        [hasJoined, channel]
    );

    return (
        <Tooltip text={getIntlMessage("FORUM_FOLLOW_TOOLTIP")} hideOnClick>
            {({ onClick, ...props }) => (
                <button
                    className={cl("vc-better-forums-follow-button", {
                        "vc-better-forums-follow-button-active": hasJoined,
                    })}
                    aria-hidden
                    tabIndex={-1}
                    onClick={event => {
                        event.stopPropagation();
                        onClick();
                        followAction();
                    }}
                    {...props}
                >
                    <Icon size={14} />
                    <BaseText size="sm" weight="normal" style={{ color: "currentcolor" }}>
                        {getIntlMessage(intlKey)}
                    </BaseText>
                </button>
            )}
        </Tooltip>
    );
});
