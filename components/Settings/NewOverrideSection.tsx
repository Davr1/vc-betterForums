/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button, Forms, TextInput, useCallback, useState } from "@webpack/common";

import { CustomTag } from "../../types";
import { _memo } from "../../utils";

interface NewOverideSectionProps {
    onCreate?: (id: CustomTag["id"]) => void;
}

export const NewOverrideSection = _memo<NewOverideSectionProps>(function NewOverideSection({
    onCreate,
}) {
    const [newTagId, setNewTagId] = useState("");

    const handleCreate = useCallback(() => {
        onCreate?.(newTagId.trim());
        setNewTagId("");
    }, [onCreate, newTagId]);

    return (
        <Forms.FormSection className="vc-better-forums-settings-row">
            <TextInput
                value={newTagId}
                onChange={setNewTagId}
                placeholder="Tag ID"
                className="vc-better-forums-custom-input-wrapper"
                inputClassName="vc-better-forums-custom-input"
                type="number"
                pattern="\d{17,19}"
            />
            <Button onClick={handleCreate} disabled={!newTagId.trim()}>
                Create override
            </Button>
        </Forms.FormSection>
    );
});
