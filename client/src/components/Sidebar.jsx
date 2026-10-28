import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, MessageSquare, Trash2, LogOut, X, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar({
  conversations,
  onDeleteConversation,
  mobileOpen,
  setMobileOpen,
  loadingConversations,
}) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleNewChat = () => {
    navigate("/");
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const sidebarContent = (
    <div className="flex h-full w-72 flex-col border-r border-slate-200 bg-slate-900 text-slate-100">
      {/* Brand & New Chat */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">ChatPilot</span>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recent Chats
        </div>

        {loadingConversations ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-slate-800" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No conversations yet. Start one above!
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conversationId === conv.id;
            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-slate-800 font-medium text-white"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Link
                  to={`/chat/${conv.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-1 items-center gap-2.5 overflow-hidden pr-2"
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-indigo-400" />
                  <span className="truncate">{conv.title || "Untitled Conversation"}</span>
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeleteConversation(conv.id);
                  }}
                  aria-label="Delete conversation"
                  title="Delete conversation"
                  className="rounded p-1 text-slate-500 opacity-0 transition hover:bg-red-950/60 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* User profile & Logout */}
      <div className="border-t border-slate-800 p-3 bg-slate-950/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-slate-400">Signed in as</span>
            <span className="truncate text-xs font-semibold text-slate-200" title={user?.email}>
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:flex h-full flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

