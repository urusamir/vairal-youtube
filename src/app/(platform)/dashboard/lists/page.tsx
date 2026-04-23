"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth.provider";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useRouter } from 'next/navigation';
// wouter imports originally here: useLocation
import {
  fetchLists,
  createList,
  deleteList,
  renameList,
  type CreatorList,
} from "@/services";
import {
  Plus,
  MoreHorizontal,
  ArrowRight,
  Trash2,
  Edit3,
  Check,
  X,
  ListChecks,
  FolderOpen,
} from "lucide-react";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { CreatorAvatar } from "@/components/creators/creator-avatar";
import { Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function ListsPanel({ hideHeader }: { hideHeader?: boolean }) {
  const { user } = useAuth();
  const prefetched = usePrefetchedData();
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const [lists, setLists] = useState<CreatorList[]>(() => prefetched.lists);
  const [isLoading, setIsLoading] = useState(() => prefetched.lists.length === 0);
  const [newListName, setNewListName] = useState("");
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadLists = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchLists(user.id);
      setLists(data);
    } catch (err) {
      console.error("[loadLists] error:", err);
    } finally {
      // ALWAYS clear loading state, even on failure
      setIsLoading(false);
    }
  };

  // Sync from prefetch provider when it updates
  useEffect(() => {
    setLists(prefetched.lists);
    setIsLoading(false);
  }, [prefetched.lists]);

  useEffect(() => {
    if (lists.length === 0) {
      loadLists();
    }
    const handler = () => loadLists();
    window.addEventListener("vairal-lists-updated", handler);
    return () => window.removeEventListener("vairal-lists-updated", handler);
  }, [user?.id]);

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    const effectiveUserId = user?.id || "local-test-user-id";
    setIsCreating(true);
    try {
      const trimmedName = newListName.trim();
      const created = await createList(effectiveUserId, trimmedName);

      if (created) {
        setLists((prev) => [{ ...created, member_count: 0 }, ...prev]);
        setNewListName("");
        setShowCreateInput(false);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("[handleCreate] error:", err);
      toast({ title: "Error", description: "Failed to create list. " + (err.message || ""), variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateClick = () => {
    if (!user?.id) return;
    if (showCreateInput && newListName.trim()) {
      handleCreate();
    } else {
      setShowCreateInput(true);
      // Focus the input after a tick
      setTimeout(() => {
        const input = document.querySelector('[data-testid="input-new-list-name"]') as HTMLInputElement;
        input?.focus();
      }, 50);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setListToDelete(id);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;
    await deleteList(listToDelete);
    toast({
      title: "List Deleted",
      description: "The list has been permanently removed.",
    });
    setListToDelete(null);
    await loadLists();
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await renameList(id, editName.trim());
    setEditingId(null);
    await loadLists();
  };

  const startEdit = (list: CreatorList, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(list.id);
    setEditName(list.name);
  };

  const displayedLists = lists;
  const showLoading = isLoading;

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full">
            {!hideHeader && (
        <FeaturePageHeader
          title="My Lists"
          description="Organize creators into curated shortlists, then reuse them in campaigns or export them for reporting."
          titleTestId="text-lists-title"
          actions={
            <div className="flex items-center gap-3 flex-wrap justify-end">

              <Button onClick={handleCreateClick} data-testid="button-create-list-header" className="shrink-0">
                <Plus className="w-4 h-4 mr-1.5" />
                Create List
              </Button>
            </div>
          }
        />
      )}

            {hideHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-foreground">Talent Lists</h2>
          <div className="flex items-center gap-3">

            
            <div className="relative w-48">
              <Input placeholder="Search lists..." className="rounded-full bg-slate-50 border-slate-200 h-9 pl-4 text-sm" />
            </div>
            
            <Select defaultValue="sort">
              <SelectTrigger className="w-[120px] rounded-full bg-white border-slate-200 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sort">Sort by</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCreateClick} data-testid="button-create-list-inline" className="h-9 rounded-full px-4 text-sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Create List
            </Button>
          </div>
        </div>
      )}
      {/* Create New List — inline form that appears on button click */}
      {showCreateInput && (
        <div className="flex items-center gap-3 w-full mb-6 max-w-full">
          <div className="flex-1 flex items-center relative border border-slate-200 rounded-full h-14 bg-white shadow-sm overflow-hidden px-2">
            <Input
              placeholder="Create"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") { setShowCreateInput(false); setNewListName(""); }
              }}
              autoFocus
              className="flex-1 border-0 shadow-none focus-visible:ring-0 text-slate-600 bg-transparent h-full px-4"
              data-testid="input-new-list-name"
            />
            <div className="flex items-center gap-2 pr-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newListName.trim()}
                data-testid="button-create-list"
                className="rounded-full bg-indigo-400 hover:bg-indigo-500 text-white shadow-none h-10 px-5"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                onClick={() => { setShowCreateInput(false); setNewListName(""); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lists Grid */}
      {showLoading ? (
        /* Inline skeleton cards — header already visible */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="relative p-5 bg-card border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-24 bg-muted rounded animate-pulse mt-3" />
            </Card>
          ))}
        </div>
      ) : displayedLists.length === 0 ? (
        <Card className="p-12 bg-card border-border text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No lists yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Create your first list to start organizing creators for your campaigns.
          </p>
          <Button onClick={handleCreateClick}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Your First List
          </Button>
        </Card>
      ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedLists.map((list) => (
            <Card
              key={list.id}
              onClick={() => setLocation(`/dashboard/lists/${list.id}`)}
              className="relative p-5 bg-white border border-slate-200 cursor-pointer transition-all duration-200 hover:border-violet-300 hover:shadow-lg rounded-2xl group flex flex-col justify-between min-h-[140px]"
              data-testid={`card-list-${list.id}`}
            >
              {editingId === list.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(list.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="text-sm"
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleRename(list.id)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start w-full">
                    <div className="flex -space-x-3">
                      {list.preview_members && list.preview_members.length > 0 ? (
                        list.preview_members.map((username, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs text-slate-500 overflow-hidden shrink-0">
                            <CreatorAvatar
                              username={username}
                              name=""
                              className="w-full h-full object-cover"
                              fallbackClassName="w-full h-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400">
                          <Users className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-slate-400 hover:text-slate-700"
                        onClick={(e) => startEdit(list, e)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                            onClick={(e) => { e.stopPropagation(); setListToDelete(list.id); }}
                            title="Delete List"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => { e.stopPropagation(); confirmDelete(); }} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between items-end w-full">
                    <div>
                      <h3 className="text-[15px] font-semibold text-slate-900 truncate max-w-[200px]">
                        {list.name}
                      </h3>
                      <p className="text-[13px] text-slate-500 mt-0.5">
                        {list.member_count || 0} Creator{(list.member_count || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


import { redirect } from "next/navigation";

export default function ListsPage() {
  redirect("/dashboard/discover?tab=lists");
}
