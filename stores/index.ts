/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findStoreLazy, proxyLazyWebpack } from "@webpack";
import {
    ChannelStore as _ChannelStore,
    GuildMemberStore as _GuildMemberStore,
    PermissionStore as _PermissionStore,
    ReadStateStore as _ReadStateStore,
    RelationshipStore as _RelationshipStore,
} from "@webpack/common";
import { FluxStore } from "@webpack/types";

import { ExtendedStores as S } from "./types";
export * from "./types";

function f<T extends FluxStore>(store: string | (() => Partial<T>)): T {
    return typeof store === "string" ? findStoreLazy(store) : (proxyLazyWebpack(store) as T);
}

export const ChannelSectionStore = f<S.ChannelSectionStore>("ChannelSectionStore");
export const ForumPostMessagesStore = f<S.ForumPostMessagesStore>("ForumPostMessagesStore");
export const ForumPostUnreadCountStore = f<S.ForumPostUnreadCountStore>(
    "ForumPostUnreadCountStore"
);
export const ForumSearchStore = f<S.ForumSearchStore>("ForumSearchStore");
export const GuildMemberRequesterStore = f<S.GuildMemberRequesterStore>(
    "GuildMemberRequesterStore"
);
export const GuildVerificationStore = f<S.GuildVerificationStore>("GuildVerificationStore");
export const JoinedThreadsStore = f<S.JoinedThreadsStore>("JoinedThreadsStore");
export const LurkingStore = f<S.LurkingStore>("LurkingStore");
export const ThreadMembersStore = f<S.ThreadMembersStore>("ThreadMembersStore");
export const ThreadMessageStore = f<S.ThreadMessageStore>("ThreadMessageStore");
export const TypingStore = f<S.TypingStore>("TypingStore");
export const UserSettingsProtoStore = f<S.UserSettingsProtoStore>("UserSettingsProtoStore");

export const ChannelStore = f<S.ChannelStore>(() => _ChannelStore);
export const GuildMemberStore = f<S.GuildMemberStore>(() => _GuildMemberStore);
export const PermissionStore = f<S.PermissionStore>(() => _PermissionStore);
export const ReadStateStore = f<S.ReadStateStore>(() => _ReadStateStore);
export const RelationshipStore = f<S.RelationshipStore & typeof RelationshipStore>(
    () => _RelationshipStore
);

export { MissingGuildMemberStore } from "./MissingGuildMemberStore";
