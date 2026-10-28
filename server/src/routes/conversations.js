import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";
import { requireAuth } from "../middleware/auth.js";
import { idParamSchema } from "../validators/schemas.js";

const router = Router();

router.use(requireAuth);

// GET /api/conversations - List user's conversations, newest first
router.get("/", async (req, res, next) => {
  try {
    const { data: conversations, error } = await supabaseAdmin
      .from("conversations")
      .select("id, title, updated_at")
      .eq("user_id", req.user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(conversations || []);
  } catch (err) {
    return next(err);
  }
});

// GET /api/conversations/:id/messages - List messages in ascending order; 404 if not user's
router.get("/:id/messages", async (req, res, next) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        error: "Validation error",
        details: paramResult.error.flatten(),
      });
    }

    const { id } = paramResult.data;

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (convError) {
      throw convError;
    }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Fetch messages in ascending order
    const { data: messages, error: msgError } = await supabaseAdmin
      .from("messages")
      .select("id, conversation_id, role, content, created_at")
      .eq("conversation_id", id)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: true });

    if (msgError) {
      throw msgError;
    }

    return res.json(messages || []);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/conversations/:id - Delete user's conversation (messages cascade)
router.delete("/:id", async (req, res, next) => {
  try {
    const paramResult = idParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      return res.status(400).json({
        error: "Validation error",
        details: paramResult.error.flatten(),
      });
    }

    const { id } = paramResult.data;

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (convError) {
      throw convError;
    }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (deleteError) {
      throw deleteError;
    }

    return res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (err) {
    return next(err);
  }
});

export default router;

