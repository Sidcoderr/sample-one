import { supabase } from "./supabase.js";

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${RAW_BASE_URL.replace(/\/$/, "")}/api`;

/**
 * Fetch wrapper that automatically attaches the Supabase JWT access token
 * and prefixes the request with VITE_API_BASE_URL + /api.
 */
export async function apiFetch(endpoint, options = {}) {
  // Obtain the current session access token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      data?.error ||
      data?.message ||
      `Request failed with status code ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

