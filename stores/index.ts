/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FluxStore } from "@vencord/discord-types";
import { findStoreLazy, proxyLazyWebpack } from "@webpack";
import {
    ChannelStore as _ChannelStore,
    GuildMemberStore as _GuildMemberStore,
    PermissionStore as _PermissionStore,
    ReadStateStore as _ReadStateStore,
    RelationshipStore as _RelationshipStore,
    UserStore as _UserStore,
    Flux,
} from "@webpack/common";

import { useStores } from "../hooks";
import { RemoveIndex } from "../types";
import { ExtendedStores as S } from "./types";
export * from "./types";

export const BaseStore = proxyLazyWebpack(
    () =>
        class BaseStore extends Flux.Store {
            use<TReturn>(
                mapper: (store: Omit<RemoveIndex<this>, "use">) => TReturn,
                deps?: unknown[],
                isEqual?: (old: TReturn, newer: TReturn) => boolean
            ): TReturn {
                return useStores([this], mapper, deps, isEqual);
            }
        }
);

export type CustomStore<TStore extends FluxStore> = TStore & InstanceType<typeof BaseStore>;

function $<T extends FluxStore>(store: string | (() => unknown)): CustomStore<T> {
    const lazyStore: T = typeof store === "string" ? findStoreLazy(store) : proxyLazyWebpack(store);

    return new Proxy(lazyStore, {
        get(target, prop) {
            if (prop === "use") return BaseStore.prototype.use.bind(target);
            return target[prop];
        },
    }) as CustomStore<T>;
}

export const ChannelSectionStore = $<S.ChannelSectionStore>("ChannelSectionStore");
export const ForumPostMessagesStore = $<S.ForumPostMessagesStore>("ForumPostMessagesStore");
export const ForumPostUnreadCountStore = $<S.ForumPostUnreadCountStore>(
    "ForumPostUnreadCountStore"
);
export const ForumSearchStore = $<S.ForumSearchStore>("ForumSearchStore");
export const GuildMemberRequesterStore = $<S.GuildMemberRequesterStore>(
    "GuildMemberRequesterStore"
);
export const GuildVerificationStore = $<S.GuildVerificationStore>("GuildVerificationStore");
export const JoinedThreadsStore = $<S.JoinedThreadsStore>("JoinedThreadsStore");
export const KeywordFilterStore = $<S.KeywordFilterStore>("KeywordFilterStore");
export const LurkingStore = $<S.LurkingStore>("LurkingStore");
export const ThreadMembersStore = $<S.ThreadMembersStore>("ThreadMembersStore");
export const ThreadMessageStore = $<S.ThreadMessageStore>("ThreadMessageStore");
export const TypingStore = $<S.TypingStore>("TypingStore");
export const UserSettingsProtoStore = $<S.UserSettingsProtoStore>("UserSettingsProtoStore");

export const ChannelStore = $<S.ChannelStore>(() => _ChannelStore);
export const GuildMemberStore = $<S.GuildMemberStore>(() => _GuildMemberStore);
export const PermissionStore = $<S.PermissionStore>(() => _PermissionStore);
export const ReadStateStore = $<S.ReadStateStore>(() => _ReadStateStore);
export const RelationshipStore = $<S.RelationshipStore>(() => _RelationshipStore);
export const UserStore = $<S.UserStore>(() => _UserStore);

export { MissingGuildMemberStore } from "./MissingGuildMemberStore";
