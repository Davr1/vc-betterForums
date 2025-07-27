/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { chooseFile, saveFile } from "@utils/web";

export async function writeFile(content: string, filename: string): Promise<void> {
    const data = new TextEncoder().encode(content);

    if (IS_DISCORD_DESKTOP) {
        await DiscordNative.fileManager.saveWithDialog(data, filename);
    } else {
        saveFile(new File([data], filename, { type: "application/json" }));
    }
}

export async function readFile(name: string): Promise<string | null> {
    if (IS_DISCORD_DESKTOP) {
        const [file] = await DiscordNative.fileManager.openFiles({
            filters: [
                { name, extensions: ["json"] },
                { name: "all", extensions: ["*"] },
            ],
        });
        return file ? new TextDecoder().decode(file.data) : null;
    } else {
        const file = await chooseFile("application/json");
        if (!file) return null;

        return await new Promise<string | null>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string | null);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}
