/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useLayoutEffect, useRef, useState } from "@webpack/common";
import { ReactNode, Ref } from "react";

import { Flex, FlexProps } from "@components/Flex";
import { cl } from "..";

interface DynamicListProps<TItem, TChildElement extends HTMLElement>
    extends Pick<FlexProps, "flexDirection" | "alignItems" | "className"> {
    items: TItem[];
    maxCount?: number;
    maxWidth?: number;
    children: (item: TItem, ref: Ref<TChildElement>, index: number, max: number) => ReactNode;
    predicate?: (item: TItem, index: number, max: number) => boolean;
    renderFallback?: () => ReactNode;
    gap?: number;
}

export function DynamicList<TItem, TChildElement extends HTMLElement>({
    items,
    maxCount,
    maxWidth,
    children,
    predicate,
    renderFallback,
    gap,
    ...props
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
        <Flex style={{ margin: 0, flexGrow: 0, flexShrink: 0 }} gap={gap} {...props}>
            {renderedItems}
            {visibleCount === 0 && renderFallback?.()}
        </Flex>
    );
}
