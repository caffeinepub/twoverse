import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { T as Message } from "../backend.d";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { formatTimestamp } from "../lib/utils";

const REACTION_EMOJIS = ["❤️", "😊", "😂", "😍", "🥺", "😢", "🎉", "👏"];

export function ChatPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("You");
  const [openReactionFor, setOpenReactionFor] = useState<bigint | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!actor) return;
    const msgs = await actor.getMessages();
    setMessages(msgs);
  }, [actor]);

  useEffect(() => {
    if (!actor) return;
    actor.getCallerUserProfile().then((p) => {
      if (p) setUserName(p.name);
    });
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [actor, loadMessages]);

  const messagesCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesCount]);

  const send = async () => {
    if (!actor || !text.trim()) return;
    setSending(true);
    try {
      const msg = await actor.sendMessage(userName, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  const myPrincipal = identity?.getPrincipal().toUint8Array();

  const hasReacted = (msg: Message, emoji: string) => {
    if (!myPrincipal) return false;
    return msg.reactions.some(
      (r) =>
        r.emoji === emoji &&
        JSON.stringify(Array.from(r.userId)) ===
          JSON.stringify(Array.from(myPrincipal)),
    );
  };

  const toggleReaction = async (
    msgId: bigint,
    emoji: string,
    already: boolean,
  ) => {
    if (!actor) return;
    if (already) {
      await actor.removeReaction(msgId, emoji);
    } else {
      await actor.addReaction(msgId, emoji);
    }
    await loadMessages();
    setOpenReactionFor(null);
  };

  const groupedReactions = (msg: Message) => {
    const map: Record<string, number> = {};
    for (const r of msg.reactions) {
      map[r.emoji] = (map[r.emoji] ?? 0) + 1;
    }
    return map;
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-2">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-10">
            No messages yet. Say hi! 💬
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={String(msg.id)}
            data-ocid={`chat.message.item.${i + 1}`}
            className="flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-sm font-semibold text-pink-600 flex-shrink-0">
              {msg.authorName[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {msg.authorName}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-700 shadow-sm border border-pink-50">
                {msg.text}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                {Object.entries(groupedReactions(msg)).map(([emoji, count]) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() =>
                      toggleReaction(msg.id, emoji, hasReacted(msg, emoji))
                    }
                    className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                      hasReacted(msg, emoji)
                        ? "bg-pink-100 border-pink-300 text-pink-600"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-pink-50"
                    }`}
                  >
                    {emoji} {count}
                  </button>
                ))}
                <div className="relative">
                  <button
                    type="button"
                    data-ocid={`chat.add_reaction_button.${i + 1}`}
                    onClick={() =>
                      setOpenReactionFor(
                        openReactionFor === msg.id ? null : msg.id,
                      )
                    }
                    className="text-xs px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-all"
                  >
                    +
                  </button>
                  {openReactionFor === msg.id && (
                    <div className="absolute bottom-7 left-0 bg-white border border-pink-100 rounded-2xl p-2 shadow-lg flex gap-1.5 flex-wrap w-44 z-20">
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
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="sticky bottom-16 bg-white border-t border-pink-100 px-4 py-3">
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
            className="flex-1 rounded-xl border-pink-200"
          />
          <Button
            data-ocid="chat.send_button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl px-3"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
