import { Bookmark, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { T as Message } from "../backend.d";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useLocalAuth } from "../contexts/LocalAuthContext";
import { useActor } from "../hooks/useActor";
import { formatTimestamp } from "../lib/helpers";

const QUICK_EMOJIS = ["❤️", "😘", "🥰", "💕", "😊"];
const REACTION_EMOJIS = ["❤️", "😘", "🥰", "💕", "😊", "😂", "🤗", "💖"];

export function ChatPage() {
  const { actor } = useActor();
  const { sessionId, name: userName } = useLocalAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [openReactionFor, setOpenReactionFor] = useState<bigint | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!actor) return;
    const msgs = await actor.getMessages();
    setMessages(msgs);
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [actor, loadMessages]);

  const messagesCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesCount]);

  const isOwn = (msg: Message): boolean => msg.authorId === sessionId;

  const send = async () => {
    if (!actor || !text.trim()) return;
    setSending(true);
    try {
      const msg = await actor.sendMessage(sessionId, userName, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const hasReacted = (msg: Message, emoji: string) =>
    msg.reactions.some((r) => r.emoji === emoji && r.sessionId === sessionId);

  const toggleReaction = async (
    msgId: bigint,
    emoji: string,
    already: boolean,
  ) => {
    if (!actor) return;
    if (already) {
      await actor.removeReaction(sessionId, msgId, emoji);
    } else {
      await actor.addReaction(sessionId, msgId, emoji);
    }
    await loadMessages();
    setOpenReactionFor(null);
  };

  const saveToMemory = async (msg: Message) => {
    if (!actor) return;
    try {
      await actor.createMemory(
        sessionId,
        userName,
        `Message from ${msg.authorName}`,
        msg.text,
        null,
      );
      toast.success("Saved to memories ✨");
    } catch {
      toast.error("Failed to save");
    }
  };

  const groupedReactions = (msg: Message) => {
    const map: Record<string, number> = {};
    for (const r of msg.reactions) {
      map[r.emoji] = (map[r.emoji] ?? 0) + 1;
    }
    return map;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div
            data-ocid="chat.empty_state"
            className="text-center pt-16 text-muted-foreground"
          >
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const own = isOwn(msg);
          return (
            <div
              key={String(msg.id)}
              data-ocid={`chat.message.item.${i + 1}`}
              className={`flex gap-2 items-end ${
                own ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {!own && (
                <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-xs font-bold text-pink-600 flex-shrink-0 mb-5">
                  {msg.authorName[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div
                className={`max-w-[72%] ${own ? "items-end" : "items-start"} flex flex-col`}
              >
                {!own && (
                  <span className="text-xs font-semibold text-pink-400 mb-1 ml-1">
                    {msg.authorName}
                  </span>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl text-sm shadow-soft ${
                    own
                      ? "bg-pink-400 text-white rounded-br-sm"
                      : "bg-white border border-pink-100 text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`flex items-center gap-1 mt-1 flex-wrap ${own ? "justify-end" : "justify-start"}`}
                >
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                  {Object.entries(groupedReactions(msg)).map(
                    ([emoji, count]) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() =>
                          toggleReaction(msg.id, emoji, hasReacted(msg, emoji))
                        }
                        className={`text-xs px-1.5 py-0.5 rounded-full border transition-all ${
                          hasReacted(msg, emoji)
                            ? "bg-pink-100 border-pink-300 text-pink-600"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-pink-50"
                        }`}
                      >
                        {emoji} {count}
                      </button>
                    ),
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      data-ocid={`chat.add_reaction_button.${i + 1}`}
                      onClick={() =>
                        setOpenReactionFor(
                          openReactionFor === msg.id ? null : msg.id,
                        )
                      }
                      className="text-xs px-1.5 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-all"
                    >
                      +
                    </button>
                    {openReactionFor === msg.id && (
                      <div
                        className={`absolute bottom-7 bg-white border border-pink-100 rounded-2xl p-2 shadow-card flex gap-1.5 flex-wrap w-44 z-20 ${
                          own ? "right-0" : "left-0"
                        }`}
                      >
                        {REACTION_EMOJIS.map((e) => (
                          <button
                            type="button"
                            key={e}
                            onClick={() =>
                              toggleReaction(msg.id, e, hasReacted(msg, e))
                            }
                            className="text-lg hover:scale-125 transition-transform"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    data-ocid={`chat.save_to_memory_button.${i + 1}`}
                    onClick={() => saveToMemory(msg)}
                    className="text-[10px] text-muted-foreground hover:text-pink-400 transition-colors flex items-center gap-0.5"
                    title="Save to Memory"
                  >
                    <Bookmark size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pt-2 flex gap-2 max-w-lg mx-auto w-full">
        {QUICK_EMOJIS.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => setText((prev) => prev + e)}
            className="text-xl hover:scale-125 transition-transform"
          >
            {e}
          </button>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-pink-100 px-4 py-3 max-w-lg mx-auto w-full">
        <div className="flex gap-2 items-center">
          <Input
            data-ocid="chat.message_input"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="flex-1 rounded-2xl border-pink-200 bg-pink-50/50 focus:bg-white"
          />
          <Button
            data-ocid="chat.send_button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="bg-pink-400 hover:bg-pink-500 text-white rounded-2xl px-3 h-10 shadow-glow"
          >
            <Send size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}
