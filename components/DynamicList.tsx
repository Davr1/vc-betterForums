/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex, useLayoutEffect, useRef, useState } from "@webpack/common";
import { ReactNode, Ref } from "react";

import { cl } from "..";

interface DynamicListProps<TItem, TChildElement extends HTMLElement> {
    items: TItem[];
    maxCount?: number;
    maxWidth?: number;
    children: (item: TItem, ref: Ref<TChildElement>, index: number) => ReactNode;
    predicate?: (item: TItem, index: number, max: number) => boolean;
    gap?: number;
    align?: string;
    direction?: string;
    className?: string;
}

export const DynamicList = function DynamicList<TItem, TChildElement extends HTMLElement>({
    items,
    maxCount,
    maxWidth,
    children,
    predicate,
    align,
    direction,
    gap,
    className,
}: DynamicListProps<TItem, TChildElement>) {
    const itemCount =
        typeof maxCount === "number" ? Math.min(items.length, maxCount) : items.length;

    const [visible, setVisible] = useState(itemCount);
    const refs = useRef<Array<TChildElement | null>>([]);

    if (itemCount !== refs.current.length) {
        refs.current = Array.from({ length: itemCount }, (_, i) => refs.current[i] ?? null);
    }

    useLayoutEffect(() => {
        if (!maxWidth) {
            setVisible(itemCount);
            return;
        }

        if (items.length === 0) return;

        let count = 0;
        let width = 0;

        for (const ref of refs.current) {
            if (!ref || width + ref.offsetWidth >= maxWidth) break;
            width += ref.offsetWidth + (gap || 0);
            count++;
        }

        setVisible(count);
    }, [maxWidth, items, itemCount, gap]);

    if (itemCount === 0) return null;

    return (
        <Flex
            className={className}
            grow={0}
            shrink={0}
            align={align}
            direction={direction}
            style={{ gap, margin: 0 }}
        >
            {items.slice(0, itemCount).map((item, i) => (
                <div
                    key={i}
                    className={cl("vc-better-forums-dynamic-item", {
                        "vc-better-forums-dynamic-item-hidden": predicate
                            ? !predicate(item, i, visible)
                            : i >= visible,
                    })}
                >
                    {children(
                        item,
                        ref => {
                            refs.current[i] = ref;
                        },
                        i
                    )}
                </div>
            ))}
        </Flex>
    );
};
