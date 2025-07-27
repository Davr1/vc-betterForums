/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex, Tooltip, useCallback } from "@webpack/common";
import { JSX } from "react";

import { cl } from "../../..";
import { CustomTagColor } from "../../../types";
import { _memo } from "../../../utils";
import { Icons } from "../../icons";

const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "blurple",
    "pink",
    "neutral",
] as const satisfies CustomTagColor[];

type ColorPickerSwatchProps = Omit<JSX.IntrinsicElements["input"], "onChange"> & ColorPickerProps;

const ColorPickerSwatch = _memo<ColorPickerSwatchProps>(function ColorPickerSwatch({
    color,
    className,
    checked,
    onChange,
    inverted,
    ...props
}) {
    const handleChange = useCallback(() => onChange(color), [onChange, color]);
    return (
        <Tooltip text={color[0].toUpperCase() + color.slice(1)}>
            {tooltipProps => (
                <label
                    className={cl("vc-better-forums-color-swatch", className)}
                    data-color={color}
                    data-inverted-color={inverted}
                    {...tooltipProps}
                >
                    <Icons.Tick className="vc-better-forums-color-swatch-tick" />
                    <input
                        type="radio"
                        value={color}
                        checked={checked}
                        onChange={handleChange}
                        {...props}
                    />
                </label>
            )}
        </Tooltip>
    );
});

interface ColorPickerProps {
    color: CustomTagColor | null;
    inverted?: boolean;
    onChange: (color: CustomTagColor | null) => void;
}

export const ColorPicker = _memo<ColorPickerProps>(function ColorPicker({
    color,
    inverted,
    onChange,
}) {
    return (
        <Flex className="vc-better-forums-color-picker">
            {colors.map(clr => (
                <ColorPickerSwatch
                    color={clr}
                    key={clr}
                    checked={clr === color}
                    onChange={onChange}
                    inverted={inverted}
                />
            ))}
            <Tooltip text="None">
                {tooltipProps => (
                    <label className="vc-better-forums-color-swatch" {...tooltipProps}>
                        <Icons.None className="vc-better-forums-color-swatch-empty" />
                        <input
                            type="radio"
                            value=""
                            checked={!color}
                            onChange={() => onChange(null)}
                        />
                    </label>
                )}
            </Tooltip>
        </Flex>
    );
});
