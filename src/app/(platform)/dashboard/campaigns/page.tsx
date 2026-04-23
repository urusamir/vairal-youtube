"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';
// wouter imports originally here: useLocation
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Plus,
  CheckCircle2,
  Circle,
  Power,
  PowerOff,
  Search,
  X,
  ExternalLink,
  Download,
  Trash2,
  Copy,
} from "lucide-react";
import { FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaSnapchatGhost } from "react-icons/fa";
import { FaTwitter as SiXIcon } from "react-icons/fa";
import {
  updateCampaign,
  deleteCampaign,
  createCampaign,
  mockCampaigns,
  readLocalCampaigns,
  addLocalCampaign,
  removeLocalCampaign,
  updateLocalCampaign,
  type Campaign,
} from "@/models/campaign.types";
import { fetchCampaigns } from "@/services";
import { useAuth } from "@/providers/auth.provider";
import { useToast } from "@/hooks/use-toast";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type SortKey = "recently_created" | "recently_updated" | "latest_start";
type Tab = "all" | "active" | "drafts" | "finished";

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  TikTok: FaTiktok,
  "Twitter/X": SiXIcon,
  LinkedIn: FaLinkedin,
  Snapchat: FaSnapchatGhost,
};

const platformColors: Record<string, string> = {
  Instagram: "text-pink-500",
  YouTube: "text-red-500",
  TikTok: "text-foreground",
  "Twitter/X": "text-foreground",
  LinkedIn: "text-blue-600",
  Snapchat: "text-yellow-400",
};

function PlatformIcon({ platform, className = "w-3.5 h-3.5" }: { platform: string; className?: string }) {
  const Icon = platformIcons[platform];
  if (!Icon) return null;
  return <Icon className={`${className} ${platformColors[platform] || ""}`} />;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type BulkAction = {
  label: string;
  action: "status" | "delete" | "duplicate";
  status?: Campaign["status"];
  className: string;
};

// Bulk actions available per tab
const BULK_ACTIONS: Record<Tab, BulkAction[]> = {
  all: [
    { label: "Duplicate", action: "duplicate", className: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "Make Active", action: "status", status: "PUBLISHED", className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "Move to Draft", action: "status", status: "DRAFT", className: "bg-amber-500/90 text-white hover:bg-amber-600" },
    { label: "Mark Finished", action: "status", status: "FINISHED", className: "bg-sky-500 text-white hover:bg-sky-600" },
    { label: "Delete", action: "delete", className: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500" },
  ],
  active: [
    { label: "Duplicate", action: "duplicate", className: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "Move to Draft", action: "status", status: "DRAFT", className: "bg-amber-500/90 text-white hover:bg-amber-600" },
    { label: "Mark Finished", action: "status", status: "FINISHED", className: "bg-sky-500 text-white hover:bg-sky-600" },
    { label: "Delete", action: "delete", className: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500" },
  ],
  drafts: [
    { label: "Duplicate", action: "duplicate", className: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "Make Active", action: "status", status: "PUBLISHED", className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "Delete", action: "delete", className: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500" },
  ],
  finished: [
    { label: "Duplicate", action: "duplicate", className: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { label: "Move to Draft", action: "status", status: "DRAFT", className: "bg-amber-500/90 text-white hover:bg-amber-600" },
    { label: "Make Active", action: "status", status: "PUBLISHED", className: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "Delete", action: "delete", className: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500" },
  ],
};

export default function CampaignsPage() {
  const { showDummy, setShowDummy } = useDummyData();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recently_created");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const prefetched = usePrefetchedData();

  // Real user campaigns from Supabase
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => prefetched.campaigns);
  const [isLoading, setIsLoading] = useState(() => prefetched.campaigns.length === 0);

  // Mock campaigns as LOCAL MUTABLE state — persisted to localStorage so duplicates survive navigation
  const [localMocks, setLocalMocks] = useState<Campaign[]>(() => {
    const extras = readLocalCampaigns();
    // Merge: extras first (user-created) then base mocks, deduplicating by id
    const extraIds = new Set(extras.map((c) => c.id));
    return [...extras, ...mockCampaigns.filter((c) => !extraIds.has(c.id))];
  });

  // Delete confirmation state
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);

  const refreshCampaigns = useCallback(async () => {
    if (!user?.id) return;
    const data = await fetchCampaigns(user.id);
    setCampaigns(data);
    setIsLoading(false);
  }, [user?.id]);

  // Sync from prefetch provider when it updates
  useEffect(() => {
    if (prefetched.campaigns.length > 0 || campaigns.length === 0) {
      setCampaigns(prefetched.campaigns);
      setIsLoading(false);
    }
  }, [prefetched.campaigns]);

  // Fallback: fetch on mount if prefetch didn't have data
  useEffect(() => {
    if (campaigns.length > 0) return;
    refreshCampaigns();
  }, [refreshCampaigns]);

  useEffect(() => {
    const handler = () => { refreshCampaigns(); };
    window.addEventListener("vairal-campaigns-updated", handler);
    window.addEventListener("vairal-auth-refreshed", handler);
    return () => {
      window.removeEventListener("vairal-campaigns-updated", handler);
      window.removeEventListener("vairal-auth-refreshed", handler);
    };
  }, [refreshCampaigns]);

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const sortFn = useCallback(
    (a: Campaign, b: Campaign) => {
      if (sortKey === "recently_updated") return b.updatedAt.localeCompare(a.updatedAt);
      if (sortKey === "latest_start") return (b.startDate || "").localeCompare(a.startDate || "");
      return b.createdAt.localeCompare(a.createdAt);
    },
    [sortKey]
  );

  const applyFilters = useCallback(
    (list: Campaign[]) => {
      const q = search.trim().toLowerCase();
      return list.filter((c) => !q || c.name.toLowerCase().includes(q)).sort(sortFn);
    },
    [search, sortFn]
  );

  // The active source — either mock or real
  const source = showDummy ? localMocks : campaigns;

  const allItems = useMemo(() => applyFilters(source), [source, applyFilters]);
  const activeItems = useMemo(() => applyFilters(source.filter((c) => c.status === "PUBLISHED")), [source, applyFilters]);
  const draftItems = useMemo(() => applyFilters(source.filter((c) => c.status === "DRAFT")), [source, applyFilters]);
  const finishedItems = useMemo(() => applyFilters(source.filter((c) => c.status === "FINISHED")), [source, applyFilters]);

  const displayed: Record<Tab, Campaign[]> = {
    all: allItems,
    active: activeItems,
    drafts: draftItems,
    finished: finishedItems,
  };

  const tabData = displayed[activeTab];

  // --- Row selection ---
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // --- Change status (works for BOTH mock and real data) ---
  const changeStatus = useCallback(
    async (id: string, newStatus: Campaign["status"]) => {
      if (showDummy) {
        // Update local mock state AND persist to localStorage
        setLocalMocks((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
          )
        );
        updateLocalCampaign(id, { status: newStatus, updatedAt: new Date().toISOString() });
      } else {
        const success = await updateCampaign(id, { status: newStatus });
        if (success) {
          refreshCampaigns();
        } else {
          toast({ title: "Failed to update status", variant: "destructive" });
        }
      }
    },
    [showDummy, refreshCampaigns]
  );

  // --- Individual Delete ---
  const handleDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setCampaignToDelete(id);
    },
    []
  );

  const confirmDelete = useCallback(
    async (id: string) => {
      if (showDummy) {
        // Remove from local state AND persist removal to localStorage
        setLocalMocks((prev) => prev.filter((c) => c.id !== id));
        removeLocalCampaign(id);
        toast({ title: "Campaign deleted" });
      } else {
        const success = await deleteCampaign(id);
        if (success) {
          refreshCampaigns();
          toast({ title: "Campaign deleted" });
        } else {
          toast({ title: "Failed to delete campaign", variant: "destructive" });
        }
      }
      setCampaignToDelete(null);
    },
    [showDummy, refreshCampaigns, toast]
  );

  // --- Duplicate ---
  const handleDuplicate = useCallback(
    async (campaign: Campaign, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user?.id) return;
      
      if (showDummy) {
        const newId = crypto.randomUUID();
        const copy: Campaign = {
          ...campaign,
          id: newId,
          name: `${campaign.name} (Copy)`,
          status: "DRAFT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        // Persist to localStorage so it survives navigation
        addLocalCampaign(copy);
        setLocalMocks((prev) => [copy, ...prev]);
        toast({ title: "Campaign duplicated", description: `"${copy.name}" created as a draft.` });
      } else {
        const { id, createdAt, updatedAt, ...rest } = campaign;
        const copyData = {
          ...rest,
          name: `${campaign.name} (Copy)`,
          status: "DRAFT" as const
        };
        const newCampaign = await createCampaign(copyData, user.id);
        if (newCampaign) {
          refreshCampaigns();
          toast({ title: "Campaign duplicated" });
        } else {
          toast({ title: "Failed to duplicate campaign", variant: "destructive" });
        }
      }
    },
    [showDummy, user?.id, refreshCampaigns, toast]
  );

  // --- Bulk action ---
  const applyBulkAction = useCallback(
    async (action: BulkAction) => {
      if (action.action === "delete") {
        setBulkDeletePending(true);
        return;
      } else if (action.action === "status" && action.status) {
        selectedIds.forEach((id) => changeStatus(id, action.status!));
        const label =
          action.status === "PUBLISHED" ? "Active" : action.status === "DRAFT" ? "Draft" : "Finished";
        toast({ title: `${selectedIds.size} campaign(s) moved to ${label}` });
        clearSelection();
      } else if (action.action === "duplicate") {
        for (const id of Array.from(selectedIds)) {
          const campaign = source.find((c) => c.id === id);
          if (campaign) {
            // Mock event for handleDuplicate compatibility
            const syntheticEvent = { stopPropagation: () => {} } as React.MouseEvent;
            await handleDuplicate(campaign, syntheticEvent);
          }
        }
        clearSelection();
      }
    },
    [selectedIds, changeStatus, clearSelection, toast, showDummy, refreshCampaigns, source, handleDuplicate]
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: allItems.length },
    { key: "active", label: "Active", count: activeItems.length },
    { key: "drafts", label: "Drafts", count: draftItems.length },
    { key: "finished", label: "Finished", count: finishedItems.length },
  ];

  const bulkActions = BULK_ACTIONS[activeTab];
  const hasSelection = selectedIds.size > 0;

  return (
    <>
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full" data-testid="page-campaigns">
      <FeaturePageHeader
        title="Campaigns"
        description="Create, sort, export, and monitor influencer campaigns from one standardized workspace."
        titleTestId="text-campaigns-title"
        actions={
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="flex items-center gap-3 rounded-full border border-white/50 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
              <Label htmlFor="dummy-toggle-campaigns" className="text-sm font-medium text-slate-700">
                Preview with data
              </Label>
              <Switch
                id="dummy-toggle-campaigns"
                checked={showDummy}
                onCheckedChange={(val) => {
                  setShowDummy(val);
                  clearSelection();
                }}
              />
            </div>
            <Button variant="outline" onClick={() => {
              const headers = ["Name", "Goal", "Status", "Budget", "Currency", "Start Date", "End Date", "Platforms", "Creators"];
              const rows = allItems.map((c: any) => [
                c.name || "",
                c.goal || "",
                c.status || "",
                String(c.totalBudget || 0),
                c.currency || "USD",
                c.startDate || "",
                c.endDate || "",
                (c.platforms || []).join("; "),
                (c.selectedCreators || []).join("; "),
              ]);
              const csv = [headers.join(","), ...rows.map((r: string[]) => r.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "campaigns-export.csv";
              a.click();
              URL.revokeObjectURL(url);
            }} disabled={allItems.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate("/dashboard/campaigns/wizard")}>
              <Plus className="w-4 h-4 mr-2" />
              Create campaign
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`tab-${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === tab.key
                  ? "bg-primary/15 text-primary"
                  : "bg-blue-50/60 text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search + Sort toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search campaigns by title"
            className="h-11 pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recently_created">Recently created</SelectItem>
            <SelectItem value="recently_updated">Recently updated</SelectItem>
            <SelectItem value="latest_start">Latest start date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {hasSelection && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-sm font-semibold text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          {bulkActions.map((action, i) => (
            <button
              key={`${action.action}-${action.status || i}`}
              onClick={() => applyBulkAction(action)}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${action.className}`}
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={clearSelection}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table or empty state */}
      {tabData.length > 0 ? (
        <Card className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 w-8" />
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Goal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platforms</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date Range</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {tabData.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        isSelected ? "bg-primary/8" : "hover:bg-muted/30"
                      } cursor-pointer`}
                      onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                    >
                      {/* Select circle — ALWAYS CLICKABLE */}
                      <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleSelect(c.id)}
                          title={isSelected ? "Deselect" : "Select campaign"}
                          className="transition-colors"
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-foreground" />
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td
                        className="py-3 text-sm text-foreground font-medium hover:text-primary transition-colors"
                      >
                        {c.name}
                      </td>

                      {/* Goal */}
                      <td className="py-3 text-sm text-muted-foreground">{c.goal || "—"}</td>

                      {/* Platforms */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {c.platforms.map((p) => (
                            <PlatformIcon key={p} platform={p} />
                          ))}
                        </div>
                      </td>

                      {/* Date range */}
                      <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {c.startDate && c.endDate
                          ? `${formatDate(c.startDate)} – ${formatDate(c.endDate)}`
                          : c.startDate
                          ? `From ${formatDate(c.startDate)}`
                          : "—"}
                      </td>

                      {/* Status — display only (change via circle select + bulk actions) */}
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold select-none ${
                            c.status === "PUBLISHED"
                              ? "bg-emerald-600 text-white"
                              : c.status === "FINISHED"
                              ? "bg-sky-600 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {c.status === "PUBLISHED" ? (
                            <><Power className="w-3.5 h-3.5" /> Live</>
                          ) : c.status === "FINISHED" ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Finished</>
                          ) : (
                            <><PowerOff className="w-3.5 h-3.5" /> Draft</>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                            title="Open campaign"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            className="text-muted-foreground hover:text-blue-500 transition-colors"
                            onClick={(e) => handleDuplicate(c, e)}
                            title="Duplicate campaign"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            onClick={(e) => handleDelete(c.id, e)}
                            title="Delete campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState tab={activeTab} onCreateClick={() => navigate("/dashboard/campaigns/wizard")} />
      )}
    </div>

      {/* Delete confirmation dialog — individual */}
      <AlertDialog open={!!campaignToDelete} onOpenChange={(open) => !open && setCampaignToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The campaign and all its data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => campaignToDelete && confirmDelete(campaignToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog — bulk */}
      <AlertDialog open={bulkDeletePending} onOpenChange={(open) => !open && setBulkDeletePending(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} campaign(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected campaigns will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                let deletedCount = 0;
                for (const id of Array.from(selectedIds)) {
                  if (showDummy) {
                    setLocalMocks((prev) => prev.filter((c) => c.id !== id));
                    deletedCount++;
                  } else {
                    const success = await deleteCampaign(id);
                    if (success) deletedCount++;
                  }
                }
                if (!showDummy && deletedCount > 0) refreshCampaigns();
                toast({ title: `${deletedCount} campaign(s) deleted` });
                clearSelection();
                setBulkDeletePending(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EmptyState({ tab, onCreateClick }: { tab: Tab; onCreateClick: () => void }) {
  const messages: Record<Tab, { title: string; body: string }> = {
    all: {
      title: "No campaigns yet",
      body: "Create your first campaign to get started.",
    },
    active: {
      title: "No active campaigns",
      body: "Select a draft campaign and make it active to publish it here.",
    },
    drafts: {
      title: "No drafts",
      body: "Campaigns you create or take offline will appear here.",
    },
    finished: {
      title: "No finished campaigns",
      body: "Select campaigns and mark them as finished to archive them here.",
    },
  };

  const { title, body } = messages[tab];

  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
        <Megaphone className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{body}</p>
      {tab !== "finished" && (
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Create campaign
        </Button>
      )}
    </Card>
  );
}
