/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@webpack/common";

import { CustomTag } from "../../types";
import { _memo } from "../../utils";
import { Icons } from "../icons";
import { Tag } from "../Tags";

interface TagRevertPreviewProps {
    tag: CustomTag;
    revertedTag: CustomTag;
}

export const TagRevertPreview = _memo<TagRevertPreviewProps>(function TagRevertPreview({
    tag,
    revertedTag,
}) {
    return (
        <Flex className="vc-better-forums-tag-revert-preview">
            <Tag tag={tag} />
            <Icons.RightArrow size={20} />
            <Tag tag={revertedTag} />
        </Flex>
    );
});
