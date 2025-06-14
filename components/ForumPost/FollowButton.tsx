/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { getIntlMessage } from "@utils/discord";
import { Text, Tooltip } from "@webpack/common";

import { cl } from "../..";
import { _memo } from "../../utils";
import { Icons } from "../icons";

interface FollowButtonProps {
    hasJoined?: boolean;
    onClick?: (hasJoined: boolean) => void;
}

export const FollowButton = _memo<FollowButtonProps>(function FollowButton({
    hasJoined = false,
    onClick: handleClick,
}) {
    const Icon = hasJoined ? Icons.Tick : Icons.Bell;
    const intlKey = hasJoined ? "FORUM_UNFOLLOW_BUTTON" : "FORUM_FOLLOW_BUTTON";

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
                        handleClick?.(hasJoined);
                    }}
                    {...props}
                >
                    <Icon size={14} />
                    <Text color="currentColor" variant="text-sm/normal">
                        {getIntlMessage(intlKey)}
                    </Text>
                </button>
            )}
        </Tooltip>
    );
});
