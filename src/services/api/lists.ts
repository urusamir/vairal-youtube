import { supabase } from "../supabase";

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

const LOCAL_LISTS_KEY = "vairal-local-lists";
const LOCAL_LIST_MEMBERS_KEY = "vairal-local-list-members";

type LocalStoredList = CreatorList & { brand_id: string };

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalLists(): LocalStoredList[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalLists(lists: LocalStoredList[]) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(LOCAL_LISTS_KEY, JSON.stringify(lists));
}

function readLocalListMembers(): CreatorListMember[] {
  if (!canUseLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_LIST_MEMBERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalListMembers(members: CreatorListMember[]) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(LOCAL_LIST_MEMBERS_KEY, JSON.stringify(members));
}

function buildLocalList(name: string, userId: string): LocalStoredList {
  return {
    id: `local-list-${crypto.randomUUID()}`,
    brand_id: userId,
    name,
    created_at: new Date().toISOString(),
    member_count: 0,
  };
}

function addLocalMember(listId: string, creatorUsername: string): boolean {
  const members = readLocalListMembers();
  const exists = members.some(
    (member) => member.list_id === listId && member.creator_username === creatorUsername
  );

  if (exists) {
    return false;
  }

  members.unshift({
    id: `local-member-${listId}-${creatorUsername}`,
    list_id: listId,
    creator_username: creatorUsername,
    added_at: new Date().toISOString(),
  });
  writeLocalListMembers(members);
  return true;
}

function removeLocalMember(listId: string, creatorUsername: string): boolean {
  const members = readLocalListMembers();
  const next = members.filter(
    (member) => !(member.list_id === listId && member.creator_username === creatorUsername)
  );
  if (next.length === members.length) return false;
  writeLocalListMembers(next);
  return true;
}

export async function fetchLists(userId: string): Promise<(CreatorList & { preview_members?: string[] })[]> {
  const localLists = readLocalLists(); // Removed filter by userId for local prototype
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

export async function getListById(listId: string): Promise<CreatorList | null> {
  return readLocalLists().find((list) => list.id === listId) || null;
}

export async function createList(userId: string, name: string): Promise<CreatorList | null> {
  const fallbackList = buildLocalList(name, userId);
  writeLocalLists([fallbackList, ...readLocalLists()]);
  window.dispatchEvent(new Event("vairal-lists-updated"));
  return fallbackList;
}

export async function deleteList(listId: string): Promise<boolean> {
  writeLocalLists(readLocalLists().filter((list) => list.id !== listId));
  writeLocalListMembers(readLocalListMembers().filter((member) => member.list_id !== listId));
  window.dispatchEvent(new Event("vairal-lists-updated"));
  return true;
}

export async function renameList(listId: string, newName: string): Promise<boolean> {
  writeLocalLists(
    readLocalLists().map((list) =>
      list.id === listId ? { ...list, name: newName } : list
    )
  );
  window.dispatchEvent(new Event("vairal-lists-updated"));
  return true;
}

export async function fetchListMembers(listId: string): Promise<CreatorListMember[]> {
  const localMembers = readLocalListMembers().filter((member) => member.list_id === listId);
  return localMembers.sort((a, b) => b.added_at.localeCompare(a.added_at));
}

export async function addCreatorToList(listId: string, creatorUsername: string): Promise<boolean> {
  const added = addLocalMember(listId, creatorUsername);
  if (added) {
    window.dispatchEvent(new Event("vairal-lists-updated"));
  }
  return added;
}

export async function removeCreatorFromList(listId: string, creatorUsername: string): Promise<boolean> {
  const removed = removeLocalMember(listId, creatorUsername);
  if (removed) {
    window.dispatchEvent(new Event("vairal-lists-updated"));
  }
  return removed;
}
