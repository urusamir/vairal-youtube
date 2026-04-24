import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";

export interface CreatorList {
  id: string;
  brand_id?: string;
  name: string;
  created_at: string;
  updated_at?: string;
  member_count?: number;
  preview_members?: string[];
}

export interface CreatorListMember {
  id?: string;
  list_id: string;
  creator_id?: string;
  creator_username: string;
  added_at: string;
}

const LOCAL_LISTS_KEY = "vairal_local_lists";
const LOCAL_LIST_MEMBERS_KEY = "vairal_local_list_members";

function isDummyMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem("vairal-dummy-mode");
  return stored === "true"; // defaults to false to allow real DB interaction
}

// --- Local Storage Helpers ---
function readLocalLists(): CreatorList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalLists(lists: CreatorList[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_LISTS_KEY, JSON.stringify(lists));
}

function readLocalListMembers(): CreatorListMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LIST_MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalListMembers(members: CreatorListMember[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_LIST_MEMBERS_KEY, JSON.stringify(members));
}
// --- End Local Storage Helpers ---

export async function fetchLists(userId: string): Promise<(CreatorList & { preview_members?: string[] })[]> {
  if (isDummyMode()) {
    const localLists = readLocalLists();
    const localMembers = readLocalListMembers();
    return localLists.map((list) => {
      const members = localMembers.filter((member) => member.list_id === list.id);
      return {
        ...list,
        member_count: members.length,
        preview_members: members.slice(0, 3).map(m => m.creator_username),
      };
    });
  }

  try {
    const { data: lists, error: listsError } = await supabase
      .from("vairal_lists")
      .select("*")
      .eq("brand_id", userId)
      .order("created_at", { ascending: false });

    if (listsError) throw listsError;
    if (!lists) return [];

    const listIds = lists.map(l => l.id);
    let members: CreatorListMember[] = [];
    
    if (listIds.length > 0) {
      const { data: membersData, error: membersError } = await supabase
        .from("vairal_list_creators")
        .select("*")
        .in("list_id", listIds)
        .order("added_at", { ascending: false });
        
      if (!membersError && membersData) {
        members = membersData as CreatorListMember[];
      }
    }

    return lists.map(list => {
      const listMembers = members.filter(m => m.list_id === list.id);
      return {
        ...list,
        member_count: listMembers.length,
        preview_members: listMembers.slice(0, 3).map(m => m.creator_username),
      };
    });
  } catch (error: any) {
    console.error("[fetchLists] Error:", error.message);
    return [];
  }
}

export async function getListById(listId: string): Promise<CreatorList | null> {
  if (isDummyMode()) {
    return readLocalLists().find((list) => list.id === listId) || null;
  }

  try {
    const { data, error } = await supabase
      .from("vairal_lists")
      .select("*")
      .eq("id", listId)
      .single();

    if (error) throw error;
    return data as CreatorList;
  } catch (error: any) {
    console.error("[getListById] Error:", error.message);
    return null;
  }
}

export async function createList(userId: string, name: string): Promise<CreatorList | null> {
  if (isDummyMode()) {
    const fallbackList: CreatorList = {
      id: `local-list-${crypto.randomUUID()}`,
      brand_id: userId,
      name,
      created_at: new Date().toISOString(),
      member_count: 0,
    };
    writeLocalLists([fallbackList, ...readLocalLists()]);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-lists-updated"));
    return fallbackList;
  }

  try {
    const { data, error } = await supabase
      .from("vairal_lists")
      .insert({
        brand_id: userId,
        name: name
      })
      .select()
      .single();

    if (error) throw error;
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vairal-lists-updated"));
    }
    
    return data as CreatorList;
  } catch (error: any) {
    console.error("[createList] Error:", error.message);
    toast({ title: "Failed to create list", description: error.message, variant: "destructive" });
    return null;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  if (isDummyMode()) {
    writeLocalLists(readLocalLists().filter((list) => list.id !== listId));
    writeLocalListMembers(readLocalListMembers().filter((member) => member.list_id !== listId));
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  }

  try {
    const { error } = await supabase
      .from("vairal_lists")
      .delete()
      .eq("id", listId);

    if (error) throw error;
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vairal-lists-updated"));
    }
    
    return true;
  } catch (error: any) {
    console.error("[deleteList] Error:", error.message);
    toast({ title: "Failed to delete list", description: error.message, variant: "destructive" });
    return false;
  }
}

export async function renameList(listId: string, newName: string): Promise<boolean> {
  if (isDummyMode()) {
    writeLocalLists(
      readLocalLists().map((list) =>
        list.id === listId ? { ...list, name: newName } : list
      )
    );
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  }

  try {
    const { error } = await supabase
      .from("vairal_lists")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", listId);

    if (error) throw error;
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vairal-lists-updated"));
    }
    
    return true;
  } catch (error: any) {
    console.error("[renameList] Error:", error.message);
    toast({ title: "Failed to rename list", description: error.message, variant: "destructive" });
    return false;
  }
}

export async function fetchListMembers(listId: string): Promise<CreatorListMember[]> {
  if (isDummyMode()) {
    const localMembers = readLocalListMembers().filter((member) => member.list_id === listId);
    return localMembers.sort((a, b) => b.added_at.localeCompare(a.added_at));
  }

  try {
    const { data, error } = await supabase
      .from("vairal_list_creators")
      .select("*")
      .eq("list_id", listId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data as CreatorListMember[];
  } catch (error: any) {
    console.error("[fetchListMembers] Error:", error.message);
    return [];
  }
}

export async function addCreatorToList(listId: string, creatorUsername: string): Promise<boolean> {
  if (isDummyMode()) {
    const members = readLocalListMembers();
    const exists = members.some(
      (member) => member.list_id === listId && member.creator_username === creatorUsername
    );
    if (exists) return false;

    members.unshift({
      id: `local-member-${listId}-${creatorUsername}`,
      list_id: listId,
      creator_username: creatorUsername,
      added_at: new Date().toISOString(),
    });
    writeLocalListMembers(members);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  }

  try {
    const { error } = await supabase
      .from("vairal_list_creators")
      .insert({
        list_id: listId,
        creator_username: creatorUsername
      });

    if (error) {
      if (error.code === '23505') return true; // Unique violation, already in list
      throw error;
    }
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vairal-lists-updated"));
    }
    
    return true;
  } catch (error: any) {
    console.error("[addCreatorToList] Error:", error.message);
    toast({ title: "Failed to add creator", description: error.message, variant: "destructive" });
    return false;
  }
}

export async function removeCreatorFromList(listId: string, creatorUsername: string): Promise<boolean> {
  if (isDummyMode()) {
    const members = readLocalListMembers();
    const next = members.filter(
      (member) => !(member.list_id === listId && member.creator_username === creatorUsername)
    );
    if (next.length === members.length) return false;
    writeLocalListMembers(next);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  }

  try {
    const { error } = await supabase
      .from("vairal_list_creators")
      .delete()
      .eq("list_id", listId)
      .eq("creator_username", creatorUsername);

    if (error) throw error;
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vairal-lists-updated"));
    }
    
    return true;
  } catch (error: any) {
    console.error("[removeCreatorFromList] Error:", error.message);
    toast({ title: "Failed to remove creator", description: error.message, variant: "destructive" });
    return false;
  }
}
