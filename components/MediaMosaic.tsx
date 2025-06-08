/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findComponentByCodeLazy } from "@webpack";

interface MediaMosaicProps {
    src: string;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    alt?: string;
    animated?: boolean;
    srcIsAnimated?: boolean;
    containerClassName?: string;
    imageClassName?: string;
}

export const MediaMosaic = findComponentByCodeLazy<MediaMosaicProps>(
    "mediaMosaicAltTextPopoutDescription"
);
