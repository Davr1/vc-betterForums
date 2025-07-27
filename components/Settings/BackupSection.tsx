/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { Button, Flex, Forms, Text, TextInput, useCallback, useState } from "@webpack/common";

import { cl } from "../..";
import { TagOverrides } from "../../types";
import {
    _memo,
    parseJSON,
    readFile,
    TextGetter,
    validateTagOverrides,
    writeFile,
} from "../../utils";
import { Icons } from "../icons";

interface BackupSectionProps {
    tags: TagOverrides;
    onLoad?: (data: TagOverrides | null) => void;
    onError?: (message: string) => void;
}

export const BackupSection = _memo<BackupSectionProps>(function BackupSection({
    tags,
    onLoad,
    onError,
}) {
    const [error, setError] = useState<string | null>(null);
    const [text, setText] = useState(() => JSON.stringify(tags));

    const handleImport = useCallback(
        (value: TextGetter) =>
            parseJSON<TagOverrides>(value, validateTagOverrides).then(onLoad).catch(onError),
        [onLoad, onError]
    );

    const handleExport = useCallback(
        () => writeFile(JSON.stringify(tags), "TagOverrides.json").catch(onError),
        [tags, onError]
    );

    const update = useCallback((value: string) => {
        setText(value);

        parseJSON<TagOverrides>(value, validateTagOverrides)
            .then(() => setError(null))
            .catch(setError);
    }, []);

    return (
        <Forms.FormSection>
            <Forms.FormTitle tag="h3">Backup & restore</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8} type={Forms.FormText.Types.DESCRIPTION}>
                Import and export your forum tag overrides as JSON for easy sharing
            </Forms.FormText>
            <div className={Margins.bottom16}>
                <Flex className="vc-better-forums-settings-row">
                    <TextInput
                        value={text}
                        onChange={update}
                        className="vc-better-forums-custom-input-wrapper"
                        inputClassName={cl("vc-better-forums-custom-input", {
                            "vc-better-forums-custom-input-error": error,
                        })}
                        placeholder="JSON"
                    />
                    {onLoad && (
                        <Button
                            disabled={!!error || !text.trim()}
                            onClick={() => handleImport(text)}
                        >
                            Load
                        </Button>
                    )}
                </Flex>
                {error && (
                    <Text variant="text-sm/medium" className="vc-better-forums-error">
                        <Icons.Error />
                        <span>{error}</span>
                    </Text>
                )}
            </div>
            <Flex className="vc-better-forums-settings-row">
                <Button
                    className="vc-better-forums-button-wide"
                    innerClassName="vc-better-forums-button"
                    onClick={handleExport}
                >
                    <Icons.Download size={18} />
                    Export to file
                </Button>
                {onLoad && (
                    <Button
                        className="vc-better-forums-button-wide"
                        innerClassName="vc-better-forums-button"
                        onClick={() => handleImport(() => readFile("TagOverrides"))}
                    >
                        <Icons.Upload size={18} />
                        Import from file
                    </Button>
                )}
            </Flex>
        </Forms.FormSection>
    );
});
