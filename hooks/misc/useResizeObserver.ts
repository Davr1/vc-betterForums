/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { lodash, useEffect, useRef, useState } from "@webpack/common";
import { RefObject } from "react";

import { Size } from "../../types";

export function useResizeObserver<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>
): Size {
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });
    const previousSize = useRef<Size>(size);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(([{ borderBoxSize }]) => {
            const [{ inlineSize, blockSize }] = borderBoxSize;
            const newSize = { width: inlineSize, height: blockSize };

            if (lodash.isEqual(previousSize.current, newSize)) return;

            previousSize.current = newSize;
            setSize(newSize);
        });

        observer.observe(ref.current, { box: "border-box" });

        return () => observer.disconnect();
    }, [ref]);

    return size;
}
