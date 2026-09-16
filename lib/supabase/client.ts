import { createBrowserClient } from "@supabase/ssr";

function getCleanEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "").trim();
  return { url, key };
}

export function createClient() {
  const { url, key } = getCleanEnv();
  return createBrowserClient(url, key);
}
