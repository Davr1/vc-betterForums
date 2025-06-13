/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { proxyLazyWebpack } from "@webpack";
import { Flux, FluxDispatcher, lodash } from "@webpack/common";
import { FluxStore } from "@webpack/types";
import { Guild, User } from "discord-types/general";

import { FluxEventHandlers, GuildMemberRequesterStore } from "./";

interface _MissingGuildMemberStore extends FluxStore {
    isMember(guildId: Guild["id"], userId: User["id"]): boolean;
    requestMembersBulk(guildId: Guild["id"], userIds: User["id"][]): void;
}

interface Member {
    user: Pick<User, "id">;
}

interface Chunk {
    guildId: Guild["id"];
    members: Member[];
    notFound?: User["id"][];
}

interface FluxEvents {
    GUILD_MEMBERS_CHUNK_BATCH: {
        chunks: Chunk[];
    };
    GUILD_MEMBER_ADD: Member & {
        guildId: Guild["id"];
    };
    GUILD_MEMBER_REMOVE: Member & {
        guildId: Guild["id"];
    };
    GUILD_MEMBER_REMOVE_LOCAL: {
        guildId: Guild["id"];
        userId: User["id"];
    };
}

export const MissingGuildMemberStore = proxyLazyWebpack(() => {
    class MissingGuildMemberStore extends Flux.Store implements _MissingGuildMemberStore {
        private missingMembers: Map<Guild["id"], Set<User["id"]>> = new Map();

        _modify(guildId: Guild["id"], fn: (set: Set<User["id"]>) => void) {
            const set = this.missingMembers.get(guildId) ?? new Set();

            const oldSet = new Set(set);
            fn(set);

            if (!lodash.isEqual(set, oldSet)) {
                this.missingMembers.set(guildId, set);
                this.emitChange();
            }
        }

        _reset() {
            this.missingMembers = new Map();
            this.emitChange();
        }

        _handleChunk(chunk: Chunk) {
            this._modify(chunk.guildId, set => {
                chunk.members.forEach(({ user }) => set.delete(user.id));
                chunk.notFound?.forEach(id => set.add(id));
            });
        }

        _handleJoin(guildId: Guild["id"], userId: User["id"]) {
            this._modify(guildId, set => set.delete(userId));
        }

        _handleLeave(guildId: Guild["id"], userId: User["id"]) {
            this._modify(guildId, set => set.add(userId));
        }

        public isMember(guildId: Guild["id"], userId: User["id"]): boolean {
            return !this.missingMembers.get(guildId)?.has(userId);
        }

        public requestMembersBulk(guildId: Guild["id"], userIds: User["id"][]): void {
            userIds
                .filter(id => this.isMember(guildId, id))
                .forEach(id => GuildMemberRequesterStore.requestMember(guildId, id));
        }
    }

    const eventHandlers: FluxEventHandlers<FluxEvents> = {
        CONNECTION_CLOSED: () => store._reset(),
        CONNECTION_OPEN: () => store._reset(),
        GUILD_MEMBERS_CHUNK_BATCH: ({ chunks }) =>
            chunks.forEach(chunk => store._handleChunk(chunk)),
        GUILD_MEMBER_ADD: ({ guildId, user }) => store._handleJoin(guildId, user.id),
        GUILD_MEMBER_REMOVE: ({ guildId, user }) => store._handleLeave(guildId, user.id),
        GUILD_MEMBER_REMOVE_LOCAL: ({ guildId, userId }) => store._handleLeave(guildId, userId),
    };

    const store = new MissingGuildMemberStore(FluxDispatcher, eventHandlers);

    return store as _MissingGuildMemberStore;
});
