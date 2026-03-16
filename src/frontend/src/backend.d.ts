export interface Reaction {
    sessionId: string;
    emoji: string;
}
export interface T__2 {
    id: bigint;
    title: string;
    authorId: string;
    authorName: string;
    description?: string;
    timestamp: bigint;
    blobId?: string;
}
export interface T__1 {
    emotion: Emotion;
    sessionId: string;
    date: string;
}
export interface T {
    id: bigint;
    authorId: string;
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
export interface backendInterface {
    registerUser(sessionId: string, name: string, passkey: string): Promise<void>;
    getProfile(sessionId: string): Promise<UserProfile | null>;
    saveProfile(sessionId: string, profile: UserProfile): Promise<void>;
    getStartDate(): Promise<string>;
    updateStartDate(sessionId: string, date: string): Promise<void>;
    submitCheckIn(sessionId: string, date: string, emotion: Emotion): Promise<void>;
    getTodayCheckIns(date: string): Promise<Array<T__1>>;
    getUserCheckIn(sessionId: string, date: string): Promise<T__1 | null>;
    getDailyPrompt(dayOfYear: bigint): Promise<string>;
    sendMessage(sessionId: string, authorName: string, text: string): Promise<T>;
    addReaction(sessionId: string, messageId: bigint, emoji: string): Promise<void>;
    removeReaction(sessionId: string, messageId: bigint, emoji: string): Promise<void>;
    getMessages(): Promise<Array<T>>;
    createMemory(sessionId: string, authorName: string, title: string, description: string | null, blobId: string | null): Promise<T__2>;
    deleteMemory(sessionId: string, memoryId: bigint): Promise<void>;
    getMemories(): Promise<Array<T__2>>;
}
