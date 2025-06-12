/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Text } from "@webpack/common";
import { HTMLProps, ReactNode } from "react";

import { cl } from "../../..";
import { LatestMessageSection } from "./LatestMessageSection";
import { MembersSection } from "./MembersSection";
import { Spacer } from "./Spacer";

interface FooterSectionProps extends HTMLProps<HTMLDivElement> {
    className?: string;
    icon?: ReactNode;
    text?: string;
    active?: boolean;
}

export function FooterSection({
    children,
    className,
    icon,
    text,
    active,
    onClick,
    ...props
}: FooterSectionProps) {
    return (
        <div
            className={cl("vc-better-forums-footer-section", className, {
                "vc-better-forums-footer-section-clickable": onClick,
                "vc-better-forums-footer-section-active": active,
            })}
            onClick={onClick}
            {...props}
        >
            {icon}
            <Text
                variant="text-sm/semibold"
                color="currentColor"
                className="vc-better-forums-footer-section-text"
            >
                {text}
            </Text>
            {children}
        </div>
    );
}

FooterSection.LatestMessage = LatestMessageSection;
FooterSection.Members = MembersSection;
FooterSection.Spacer = Spacer;
