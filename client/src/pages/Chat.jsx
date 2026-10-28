import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import { apiFetch } from "../lib/api.js";

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch all conversations for sidebar
  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiFetch("/conversations");
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      // Suppress noisy network errors if initial load or let user know
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages when conversationId changes
  const fetchMessages = useCallback(async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setErrorMessage("");

    try {
      const data = await apiFetch(`/conversations/${id}/messages`);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      if (err.status === 404) {
        setErrorMessage("Conversation not found.");
        navigate("/", { replace: true });
      } else {
        setErrorMessage(err.message || "Failed to load messages.");
      }
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId, fetchMessages]);

  // Current active conversation title
  const currentConversation = conversations.find((c) => c.id === conversationId);
  const activeTitle = currentConversation?.title || (conversationId ? "Chat" : "New Chat");

  // Handle send message
  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isThinking) return;

    setInput("");
    setErrorMessage("");

    // Temporary optimistic user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsThinking(true);

    try {
      const body = {
        message: trimmedInput,
        ...(conversationId ? { conversationId } : {}),
      };

      const result = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify(body),
      });

      // Replace optimistic message and append assistant reply
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, result.userMessage, result.assistantMessage];
      });

      // Refresh conversations list to update ordering/title
      await fetchConversations();

      // If this was a new conversation, update route without reloading
      if (!conversationId && result.conversationId) {
        navigate(`/chat/${result.conversationId}`, { replace: true });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setErrorMessage(err.message || "Failed to get a response from ChatPilot.");
      // If server returned 502 with saved user message, fetch updated messages
      if (conversationId) {
        fetchMessages(conversationId);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async (idToDelete) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      await apiFetch(`/conversations/${idToDelete}`, {
        method: "DELETE",
      });

      setConversations((prev) => prev.filter((c) => c.id !== idToDelete));

      if (conversationId === idToDelete) {
        navigate("/", { replace: true });
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      setErrorMessage(err.message || "Failed to delete conversation.");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <ErrorBanner
        message={errorMessage}
        onDismiss={() => setErrorMessage("")}
      />

      {/* Sidebar navigation */}
      <Sidebar
        conversations={conversations}
        onDeleteConversation={handleDeleteConversation}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        loadingConversations={loadingConversations}
      />

      {/* Main chat view */}
      <ChatWindow
        messages={messages}
        loadingMessages={loadingMessages}
        isThinking={isThinking}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onOpenMobileSidebar={() => setMobileOpen(true)}
        conversationTitle={activeTitle}
      />
    </div>
  );
}

