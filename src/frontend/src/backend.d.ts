import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Reaction {
    userId: Uint8Array;
    emoji: string;
}
export interface T__2 {
    id: Id;
    title: string;
    authorId: Uint8Array;
    authorName: string;
    description?: string;
    timestamp: bigint;
    blobId?: string;
}
export interface T__1 {
    emotion: Emotion;
    userId: Uint8Array;
    date: string;
}
export interface T {
    id: bigint;
    authorId: Uint8Array;
    text: string;
    authorName: string;
    timestamp: bigint;
    reactions: Array<Reaction>;
}
export type Id = bigint;
export interface UserProfile {
    name: string;
}
export enum Emotion {
    sad = "sad",
    tired = "tired",
    happy = "happy",
    calm = "calm",
    stressed = "stressed",
    excited = "excited"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addReaction(messageId: bigint, emoji: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMemory(authorName: string, title: string, description: string | null, blobId: string | null): Promise<T__2>;
    deleteMemory(memoryId: bigint): Promise<void>;
    getBlobLink(blobId: string): Promise<string | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyPrompt(dayOfYear: bigint): Promise<string>;
    getMemories(): Promise<Array<T__2>>;
    getMessages(): Promise<Array<T>>;
    getStartDate(): Promise<string>;
    getTodayCheckIns(date: string): Promise<Array<T__1>>;
    getUserCheckIn(date: string): Promise<T__1 | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerWithInviteCode(code: string, profile: UserProfile): Promise<void>;
    removeReaction(messageId: bigint, emoji: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(authorName: string, text: string): Promise<T>;
    submitCheckIn(date: string, emotion: Emotion): Promise<void>;
    updateInviteCode(newCode: string): Promise<void>;
    updateStartDate(newDate: string): Promise<void>;
}
