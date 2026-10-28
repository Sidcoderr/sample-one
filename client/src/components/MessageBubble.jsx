import React from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 max-w-3xl ml-auto py-2">
        <div className="flex max-w-[85%] sm:max-w-[75%] flex-col items-end">
          <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-white shadow-sm">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
          {message.created_at && (
            <span className="mt-1 text-[11px] text-slate-400 px-1">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 shadow-sm mt-0.5">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-start gap-3 max-w-3xl mr-auto py-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm mt-0.5">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex max-w-[85%] sm:max-w-[80%] flex-col items-start">
        <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-slate-800 shadow-sm border border-slate-200/80">
          <div className="prose-chat text-sm leading-relaxed break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
        {message.created_at && (
          <span className="mt-1 text-[11px] text-slate-400 px-1">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

