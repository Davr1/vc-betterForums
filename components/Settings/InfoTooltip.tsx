/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Tooltip } from "@webpack/common";

import { cl } from "../..";
import { Icons } from "../icons";

interface InfoTooltipProps {
    text?: string;
    className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
    if (!text?.trim()) return null;

    return (
        <Tooltip text={text}>
            {props => (
                <div className={cl("vc-better-forums-icon-container", className)} {...props}>
                    <Icons.Info size={20} />
                </div>
            )}
        </Tooltip>
    );
}
