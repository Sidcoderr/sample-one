import React, { useEffect, useRef } from "react";
import { Menu, Sparkles, MessageSquarePlus } from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";
import ChatInput from "./ChatInput.jsx";

export default function ChatWindow({
  messages,
  loadingMessages,
  isThinking,
  input,
  setInput,
  onSend,
  onOpenMobileSidebar,
  conversationTitle,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-slate-50">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Toggle menu"
            className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {conversationTitle || "New Conversation"}
            </h1>
          </div>
        </div>
      </header>

      {/* Main messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {loadingMessages ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="text-xs font-medium">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State: "Start a new conversation" */
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                Start a new conversation
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Say hello or ask ChatPilot a question. Gemini will answer with clear, structured markdown responses.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full text-left">
                {[
                  "Explain quantum computing in simple terms",
                  "Write a clean JavaScript debounce function",
                  "Suggest 5 quick healthy lunch ideas",
                  "Help me draft a polite follow-up email",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput(sample);
                    }}
                    className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/40 text-left"
                  >
                    <MessageSquarePlus className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span>{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id || Math.random()} message={message} />
              ))}
              {isThinking && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={onSend}
        disabled={isThinking}
      />
    </div>
  );
}

