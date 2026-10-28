import { Router } from "express";
import rateLimit from "express-rate-limit";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { generateReply } from "../lib/gemini.js";
import { requireAuth } from "../middleware/auth.js";
import { chatSchema } from "../validators/schemas.js";

const router = Router();

// Rate limit /api/chat: 20 requests/minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

router.use(requireAuth);

// POST /api/chat
router.post("/", chatLimiter, async (req, res, next) => {
  try {
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation error",
        details: parseResult.error.flatten(),
      });
    }

    const { conversationId, message } = parseResult.data;
    let activeConversationId = conversationId;
    let conversationTitle = "";

    // 1. Resolve or create conversation
    if (activeConversationId) {
      const { data: existingConv, error: fetchConvError } = await supabaseAdmin
        .from("conversations")
        .select("id, title")
        .eq("id", activeConversationId)
        .eq("user_id", req.user.id)
        .maybeSingle();

      if (fetchConvError) {
        throw fetchConvError;
      }

      if (!existingConv) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      conversationTitle = existingConv.title;
    } else {
      // Auto-set title from the first 50 characters of the first user message
      conversationTitle = message.slice(0, 50).trim() || "New Chat";

      const { data: newConv, error: createConvError } = await supabaseAdmin
        .from("conversations")
        .insert({
          user_id: req.user.id,
          title: conversationTitle,
        })
        .select("id, title")
        .single();

      if (createConvError) {
        throw createConvError;
      }

      activeConversationId = newConv.id;
      conversationTitle = newConv.title;
    }

    // 2. Save user message
    const { data: userMessageRow, error: saveUserMsgError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        user_id: req.user.id,
        role: "user",
        content: message,
      })
      .select("id, conversation_id, role, content, created_at")
      .single();

    if (saveUserMsgError) {
      throw saveUserMsgError;
    }

    // 3. Load last 20 messages for Gemini history
    const { data: recentMessages, error: historyError } = await supabaseAdmin
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", activeConversationId)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (historyError) {
      throw historyError;
    }

    // Sort ascending for chronological context
    const history = (recentMessages || [])
      .slice()
      .reverse()
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // 4. Call Gemini
    let assistantReply = "";
    try {
      assistantReply = await generateReply(history);
    } catch (geminiError) {
      console.error("[Gemini Error]:", geminiError.message || geminiError);
      // Keep saved user message and return 502
      return res.status(502).json({
        error: "AI service unavailable, please try again.",
      });
    }

    // 5. Save assistant reply
    const { data: assistantMessageRow, error: saveAssistantMsgError } =
      await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: activeConversationId,
          user_id: req.user.id,
          role: "assistant",
          content: assistantReply,
        })
        .select("id, conversation_id, role, content, created_at")
        .single();

    if (saveAssistantMsgError) {
      throw saveAssistantMsgError;
    }

    return res.json({
      conversationId: activeConversationId,
      title: conversationTitle,
      userMessage: userMessageRow,
      assistantMessage: assistantMessageRow,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;

