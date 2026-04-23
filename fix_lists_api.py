import re

with open("src/services/api/lists.ts", "r") as f:
    content = f.read()

# fetchLists
content = re.sub(
    r'export async function fetchLists\(.*?\}',
    '''export async function fetchLists(userId: string): Promise<CreatorList[]> {
  const localLists = readLocalLists().filter((list) => list.brand_id === userId);
  const localMembers = readLocalListMembers();
  return localLists.map((list) => ({
    ...list,
    member_count: localMembers.filter((member) => member.list_id === list.id).length,
  }));
}''',
    content,
    flags=re.DOTALL
)

# getListById
content = re.sub(
    r'export async function getListById\(.*?\}',
    '''export async function getListById(listId: string): Promise<CreatorList | null> {
  return readLocalLists().find((list) => list.id === listId) || null;
}''',
    content,
    flags=re.DOTALL
)

# createList
content = re.sub(
    r'export async function createList\(.*?\}',
    '''export async function createList(userId: string, name: string): Promise<CreatorList | null> {
  const fallbackList = buildLocalList(name, userId);
  writeLocalLists([fallbackList, ...readLocalLists()]);
  toast({ title: "List Created", description: `"${name}" has been created.` });
  window.dispatchEvent(new Event("vairal-lists-updated"));
  return fallbackList;
}''',
    content,
    flags=re.DOTALL
)

# deleteList
content = re.sub(
    r'export async function deleteList\(.*?\}',
    '''export async function deleteList(listId: string): Promise<boolean> {
  writeLocalLists(readLocalLists().filter((list) => list.id !== listId));
  writeLocalListMembers(readLocalListMembers().filter((member) => member.list_id !== listId));
  window.dispatchEvent(new Event("vairal-lists-updated"));
  return true;
}''',
    content,
    flags=re.DOTALL
)

# renameList
content = re.sub(
    r'export async function renameList\(.*?\}',
    '''export async function renameList(listId: string, newName: string): Promise<boolean> {
  writeLocalLists(
    readLocalLists().map((list) =>
      list.id === listId ? { ...list, name: newName } : list
    )
  );
  window.dispatchEvent(new Event("vairal-lists-updated"));
  return true;
}''',
    content,
    flags=re.DOTALL
)

# fetchListMembers
content = re.sub(
    r'export async function fetchListMembers\(.*?\}',
    '''export async function fetchListMembers(listId: string): Promise<CreatorListMember[]> {
  const localMembers = readLocalListMembers().filter((member) => member.list_id === listId);
  return localMembers.sort((a, b) => b.added_at.localeCompare(a.added_at));
}''',
    content,
    flags=re.DOTALL
)

# addCreatorToList
content = re.sub(
    r'export async function addCreatorToList\(.*?\}',
    '''export async function addCreatorToList(listId: string, creatorUsername: string): Promise<boolean> {
  const added = addLocalMember(listId, creatorUsername);
  if (added) {
    toast({ title: "Creator Added", description: "Added to list successfully." });
    window.dispatchEvent(new Event("vairal-lists-updated"));
  }
  return added;
}''',
    content,
    flags=re.DOTALL
)

# removeCreatorFromList
content = re.sub(
    r'export async function removeCreatorFromList\(.*?\}',
    '''export async function removeCreatorFromList(listId: string, creatorUsername: string): Promise<boolean> {
  const removed = removeLocalMember(listId, creatorUsername);
  if (removed) {
    window.dispatchEvent(new Event("vairal-lists-updated"));
  }
  return removed;
}''',
    content,
    flags=re.DOTALL
)

with open("src/services/api/lists.ts", "w") as f:
    f.write(content)
