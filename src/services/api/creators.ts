import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";

const LOCAL_SAVED_CREATORS_KEY = "vairal_local_saved_creators";

function isDummyMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem("vairal-dummy-mode");
  return stored === "true"; // defaults to false to allow real DB interaction
}

function readLocalSavedCreators(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_SAVED_CREATORS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalSavedCreators(usernames: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_SAVED_CREATORS_KEY, JSON.stringify(usernames));
}

export async function fetchSavedCreators(userId: string): Promise<string[]> {
  if (isDummyMode()) {
    return readLocalSavedCreators();
  }

  try {
    const { data, error } = await supabase
      .from("vairal_creators")
      .select("creator_username")
      .eq("user_id", userId);

    if (error) {
      console.error("[fetchSavedCreators] Error:", error.message);
      return [];
    }
    return (data || []).map((d: any) => d.creator_username);
  } catch (err: any) {
    console.error("[fetchSavedCreators] Exception:", err.message);
    return [];
  }
}

export async function saveCreator(
  userId: string,
  creator: {
    username: string;
    fullname: string;
    platform: string;
    followers?: number;
    er?: number;
    categories?: string[];
  }
): Promise<boolean> {
  if (isDummyMode()) {
    const current = readLocalSavedCreators();
    if (!current.includes(creator.username)) {
      writeLocalSavedCreators([...current, creator.username]);
    }
    toast({ title: "Creator Saved", description: `Added @${creator.username} to your saved creators.` });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "save", username: creator.username }}));
    }
    return true;
  }

  try {
    const payload = {
      user_id: userId,
      creator_username: creator.username,
      creator_name: creator.fullname,
      platform: creator.platform,
      followers: creator.followers || 0,
      engagement_rate: creator.er || 0,
      categories: creator.categories || [],
    };

    const { data, error } = await supabase
      .from("vairal_creators")
      .insert(payload)
      .select();

    if (error) {
      // Duplicate — treat as success
      if (error.code === "23505") {
        return true; 
      }
      console.error("[saveCreator] Supabase error:", error.code, error.message, error.details, error.hint);
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return false;
    }

    if (!data || data.length === 0) {
      console.warn("[saveCreator] Insert returned no data — possible SELECT RLS block. Proceeding optimistically.");
    } else {
      toast({ title: "Creator Saved", description: `Added @${creator.username} to your saved creators.` });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "save", username: creator.username }}));
    }
    return true;
  } catch (err: any) {
    console.error("[saveCreator] Exception:", err);
    toast({ title: "Save Error", description: err?.message || "Unexpected error saving creator.", variant: "destructive" });
    return false;
  }
}

export async function unsaveCreator(userId: string, username: string): Promise<boolean> {
  if (isDummyMode()) {
    const current = readLocalSavedCreators();
    writeLocalSavedCreators(current.filter((u) => u !== username));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "unsave", username }}));
    }
    return true;
  }

  try {
    const { error } = await supabase
      .from("vairal_creators")
      .delete()
      .eq("user_id", userId)
      .eq("creator_username", username);

    if (error) {
      console.error("[unsaveCreator] Supabase error:", error.code, error.message);
      toast({ title: "Unsave Failed", description: error.message, variant: "destructive" });
      return false;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "unsave", username }}));
    }
    return true;
  } catch (err: any) {
    console.error("[unsaveCreator] Exception:", err);
    toast({ title: "Unsave Error", description: err?.message || "Unexpected error.", variant: "destructive" });
    return false;
  }
}
