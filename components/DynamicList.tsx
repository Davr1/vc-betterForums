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
    children: (item: TItem, ref: Ref<TChildElement>, index: number, max: number) => ReactNode;
    predicate?: (item: TItem, index: number, max: number) => boolean;
    renderFallback?: () => ReactNode;
    gap?: number;
    align?: string;
    direction?: string;
    className?: string;
}

export function DynamicList<TItem, TChildElement extends HTMLElement>({
    items,
    maxCount,
    maxWidth,
    children,
    predicate,
    renderFallback,
    align,
    direction,
    gap,
    className,
}: DynamicListProps<TItem, TChildElement>) {
    const itemCount =
        typeof maxCount === "number" ? Math.min(items.length, maxCount) : items.length;

    const [max, setMax] = useState(itemCount);
    const refs = useRef<Array<TChildElement | null>>([]);

    if (itemCount !== refs.current.length) {
        refs.current = Array.from({ length: itemCount }, (_, i) => refs.current[i] ?? null);
    }

    useLayoutEffect(() => {
        if (!maxWidth) {
            setMax(itemCount);
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

        setMax(count);
    }, [maxWidth, items, itemCount, gap]);

    let visibleCount = 0;

    const renderedItems = items.slice(0, itemCount).map((item, i) => {
        const isVisible = predicate ? predicate(item, i, max) : i < max;
        if (isVisible) visibleCount++;

        return (
            <div
                key={i}
                className={cl("vc-better-forums-dynamic-item", {
                    "vc-better-forums-dynamic-item-hidden": !isVisible,
                })}
            >
                {children(
                    item,
                    ref => {
                        refs.current[i] = ref;
                    },
                    i,
                    max
                )}
            </div>
        );
    });

    if (itemCount === 0) return renderFallback?.() ?? null;

    return (
        <Flex
            className={className}
            grow={0}
            shrink={0}
            align={align}
            direction={direction}
            style={{ gap, margin: 0 }}
        >
            {renderedItems}
            {visibleCount === 0 && renderFallback?.()}
        </Flex>
    );
}
