/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findByPropsLazy } from "@webpack";
import { ComponentType, HTMLProps, MouseEvent } from "react";

import { BoundingBox, UnfurledMediaItem } from "../types";

export enum MediaLayoutType {
    STATIC = "STATIC",
    RESPONSIVE = "RESPONSIVE",
    MOSAIC = "MOSAIC",
}

export interface ImageProps
    extends Pick<
            UnfurledMediaItem,
            "alt" | "srcIsAnimated" | "placeholderVersion" | "placeholder" | "original"
        >,
        Partial<BoundingBox>,
        Omit<HTMLProps<HTMLDivElement>, "width" | "height"> {
    zoomThumbnailPlaceholder?: string;
    onZoom: (
        event: MouseEvent<HTMLDivElement>,
        context?: { trigger: "CLICK" } & Pick<ImageProps, "zoomThumbnailPlaceholder">
    ) => void;
    shouldLink?: boolean;
    autoPlay?: boolean;
    imageClassName?: string;
    animated?: boolean;
    shouldAnimate?: boolean;
    renderAccessory?: ComponentType;
    limitResponsiveWidth?: boolean;
    useFullWidth?: boolean;
    dataSafeSrc?: string;
    mediaLayoutType?: MediaLayoutType;
    shouldRenderAccessory?: boolean;
    freeze?: boolean;
}

interface ImageUtils {
    preloadImage: (args: {
        src: string;
        dimensions: Partial<
            Record<"maxWidth" | "maxHeight" | "imageWidth" | "imageHeight", number>
        >;
        options: Pick<UnfurledMediaItem, "srcIsAnimated" | "original" | "sourceMetadata"> &
            Pick<ImageProps, "freeze" | "animated">;
    }) => void;
}

export const Image: ComponentType<ImageProps> & ImageUtils = findByPropsLazy(
    "preloadImage",
    "trackLoadingCompleted"
);
