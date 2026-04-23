"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef, memo, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
// wouter imports originally here: useLocation
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Check,
  Plus,
  Trash2,
  UserPlus,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  Loader2,
  Cloud,
  Headphones,
  Megaphone,
  Rocket,
  UserCheck,
  ShoppingCart,
  PencilLine,
  CalendarDays,
  Download,
  UsersRound,
  Target,
  Sparkles,
  BadgeDollarSign,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type Campaign,
  type CampaignBrief,
  type Deliverable,
  getCampaignAsync,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createDefaultCampaign,
  goals,
  platformOptions,
  countries,
  ageRanges,
  currencies,
  contentTypes,
} from "@/models/campaign.types";
import { syncCampaignDeliverablesToCalendar } from "@/services/api/calendar";
import { useAuth } from "@/providers/auth.provider";
import { formatDisplayDate, formatMonthDay } from "@/utils/format";
import { creatorsData } from "@/models/creators.data";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { CreatorAvatar } from "@/components/creators/creator-avatar";

const stepLabels = [
  "Campaign Basics",
  "Campaign Brief",
  "Ad Creators and Deliverables",
  "Review & Publish",
];

const wizardSurface = "bg-white border border-[#eceefa] shadow-[0_18px_50px_rgba(31,41,55,0.04)]";
const wizardInputClass = "h-10 rounded-xl border-[#e4e7f2] bg-white text-[#17213b] placeholder:text-[#8a94ad] shadow-sm focus-visible:ring-[#7c5cff]/20 focus-visible:border-[#9b87ff]";
const wizardSelectTriggerClass = "h-10 rounded-xl border-[#e4e7f2] bg-white text-[#17213b] shadow-sm focus:ring-[#7c5cff]/20 focus:border-[#9b87ff]";

const stepDescriptions = [
  "Select the core objective, audience, dates, and budget.",
  "Shape the creative direction, messages, and deliverable brief.",
  "Choose creators and allocate the work across the campaign.",
  "Review the launch plan, timeline, and execution health.",
];

const goalVisuals: Record<string, { icon: React.ComponentType<{ className?: string }>; tint: string; iconColor: string }> = {
  "Brand Awareness": { icon: Megaphone, tint: "bg-[#f2efff]", iconColor: "text-[#7c5cff]" },
  "Product Launch": { icon: Rocket, tint: "bg-[#f7efff]", iconColor: "text-[#a855f7]" },
  "Lead Generation": { icon: UserCheck, tint: "bg-[#eefdff]", iconColor: "text-[#14b8a6]" },
  "Sales / Conversions": { icon: ShoppingCart, tint: "bg-[#f7efff]", iconColor: "text-[#9b5cf6]" },
  "Content Creation": { icon: PencilLine, tint: "bg-[#fff3eb]", iconColor: "text-[#fb7c45]" },
  "Event Promotion": { icon: CalendarDays, tint: "bg-[#f2efff]", iconColor: "text-[#7c5cff]" },
  "App Installs": { icon: Download, tint: "bg-[#eef5ff]", iconColor: "text-[#3b82f6]" },
  "Community Building": { icon: UsersRound, tint: "bg-[#fff3eb]", iconColor: "text-[#fb8a4d]" },
};

const platformVisuals: Record<string, { icon: React.ReactNode; color: string }> = {
  Instagram: { icon: <span className="text-[13px] font-black">◎</span>, color: "text-[#e41469]" },
  YouTube: { icon: <span className="text-[13px] font-black">▶</span>, color: "text-[#ef4444]" },
  TikTok: { icon: <span className="text-[13px] font-black">♪</span>, color: "text-[#111936]" },
  "Twitter/X": { icon: <span className="text-[13px] font-black">𝕏</span>, color: "text-[#111936]" },
  LinkedIn: { icon: <span className="text-[13px] font-black">in</span>, color: "text-[#2563eb]" },
  Snapchat: { icon: <span className="text-[13px]">♟</span>, color: "text-[#eab308]" },
};

const countryFlags: Record<string, string> = {
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  India: "🇮🇳",
  Pakistan: "🇵🇰",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Egypt: "🇪🇬",
  Kuwait: "🇰🇼",
  Qatar: "🇶🇦",
  Bahrain: "🇧🇭",
  Oman: "🇴🇲",
  Jordan: "🇯🇴",
};

// --- Memoized Wizard Components ---
const SelectionCard = memo(({
  creator,
  isShortlisted,
  onAdd,
  onRemove
}: {
  creator: any,
  isShortlisted: boolean,
  onAdd: (id: string) => void,
  onRemove: (id: string) => void
}) => {
  return (
    <Card
      className={`p-4 transition-all duration-300 ${
        isShortlisted ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-background/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CreatorAvatar
            username={creator.username}
            name={creator.fullname || creator.username}
            className="w-10 h-10 rounded-full object-cover bg-muted shrink-0"
            fallbackClassName="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-white">{creator.fullname}</p>
            <p className="text-xs text-muted-foreground">@{creator.username}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant={isShortlisted ? "destructive" : "outline"}
          onClick={() => isShortlisted ? onRemove(creator.username) : onAdd(creator.username)}
          className="h-8 rounded-full text-[10px] font-bold uppercase tracking-tight"
        >
          {isShortlisted ? <Trash2 className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          {isShortlisted ? "Remove" : "Shortlist"}
        </Button>
      </div>
    </Card>
  );
});

function CampaignWizardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setLocation = (path: string) => router.push(path);
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const campaignId = searchParams.get("id");
  const requestedStep = Number(searchParams.get("step") || "");
  const isNew = !campaignId;

  const [campaign, setCampaign] = useState<Omit<Campaign, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string; updatedAt?: string }>(createDefaultCampaign());
  const [step, setStep] = useState(1);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const isSavingRef = useRef(false);
  const readOnly = campaign.status === "PUBLISHED" || campaign.status === "FINISHED";

  useEffect(() => {
    if (!isNew && campaignId) {
      getCampaignAsync(campaignId, user?.id).then((existing) => {
        if (existing) {
          setCampaign(existing);
          // If it's a published/finished campaign, start at Step 1 for overview.
          // Otherwise, continue where they left off.
          if (!Number.isNaN(requestedStep) && requestedStep >= 1 && requestedStep <= 4) {
            setStep(requestedStep);
          } else if (existing.status === "PUBLISHED" || existing.status === "FINISHED") {
            setStep(1);
          } else {
            setStep(existing.lastStep || 1);
          }
          setSavedId(existing.id);
        }
      });
    } else if (isNew) {
      setCampaign(createDefaultCampaign());
      setStep(1);
      setSavedId(null);
    }
  }, [campaignId, isNew, requestedStep, user?.id]);

  const updateField = useCallback(<K extends keyof Campaign>(field: K, value: Campaign[K]) => {
    if (readOnly) return;
    setCampaign((prev) => ({ ...prev, [field]: value }));
  }, [readOnly]);

  const saveDraft = useCallback(async () => {
    const data = { ...campaign, lastStep: step, status: campaign.status || "DRAFT" };
    if (savedId) {
      const success = await updateCampaign(savedId, data);
      if (success) {
        toast({ title: "Draft saved", description: "Your campaign draft has been saved." });
      }
    } else {
      const created = await createCampaign(data, user?.id || "");
      if (created) {
        setSavedId(created.id);
        toast({ title: "Draft created", description: "Your campaign draft has been created." });
      }
    }
  }, [campaign, step, savedId, toast, user?.id]);

  const saveDraftQuietly = useCallback(async () => {
    if (readOnly || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const data = { ...campaign, lastStep: step, status: campaign.status || "DRAFT" };
      if (savedId) {
        await updateCampaign(savedId, data);
      } else {
        if (!data.name && !data.brand) return; // Require some minimal input before creating record
        const created = await createCampaign(data, user?.id || "");
        if (created) {
          setSavedId(created.id);
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [campaign, step, savedId, user?.id, readOnly]);

  useEffect(() => {
    if (readOnly || isPublishing) return;
    if (isNew && !savedId && !campaign.name && !campaign.brand) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftQuietly();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [campaign, step, readOnly, isNew, savedId, saveDraftQuietly, isPublishing]);

  const saveDraftAndExit = async () => {
    await saveDraftQuietly();
    toast({ title: "Draft saved", description: "Your campaign draft has been saved." });
    setTimeout(() => setLocation("/dashboard/campaigns"), 500);
  };

  const publish = useCallback(async () => {
    if (isPublishing || isSavingRef.current) return;

    // Immediate cancellation of any pending background save
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    if (!campaign.name || !campaign.brand || !campaign.product || !campaign.goal || campaign.platforms.length === 0 || !campaign.startDate || !campaign.endDate) {
      toast({ title: "Validation error", description: "Please complete all required fields in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (campaign.endDate < campaign.startDate) {
      toast({ title: "Validation error", description: "End date must be after or equal to start date.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (campaign.totalBudget <= 0) {
      toast({ title: "Validation error", description: "Please set a valid budget in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (!campaign.briefs || campaign.briefs.length === 0) {
      toast({ title: "Validation error", description: "Please provide at least one Brief (Step 2).", variant: "destructive" });
      setStep(2);
      return;
    }
    if (!campaign.selectedCreators || campaign.selectedCreators.length === 0) {
      toast({ title: "Validation error", description: "Please add at least one creator (Step 3).", variant: "destructive" });
      setStep(3);
      return;
    }
    const missingDeliverables = campaign.selectedCreators.some((c: any) => !c.deliverables || c.deliverables.length === 0);
    if (missingDeliverables) {
      toast({ title: "Validation error", description: "All selected creators must have at least one deliverable allocated.", variant: "destructive" });
      setStep(3);
      return;
    }
    const missingBriefs = campaign.selectedCreators.some((c: any) => c.deliverables?.some((d: any) => !d.briefId));
    if (missingBriefs) {
      toast({ title: "Validation error", description: "All deliverables must be linked to a brief. Check the Brief column (red fields) in Step 3.", variant: "destructive" });
      setStep(3);
      return;
    }

    setIsPublishing(true);
    isSavingRef.current = true;
    try {
      const data = { ...campaign, status: "PUBLISHED" as const, lastStep: 4 };

      // 30s timeout — publish must NEVER hang forever
      const raceTimeout = (p: Promise<unknown>, ms: number, label: string) =>
        Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))]);

      if (savedId) {
        const success = await raceTimeout(updateCampaign(savedId, data), 30000, "Campaign update") as boolean;
        if (success) {
          // Fire-and-forget: calendar sync in background
          if (user?.id) {
            syncCampaignDeliverablesToCalendar({ ...data, id: savedId }, user.id)
              .catch(e => console.warn("[calendar sync] background error:", e));
          }
          toast({ title: "Campaign published! 🎉", description: "Your campaign is now live." });
          window.dispatchEvent(new Event("vairal-campaigns-updated"));
          setTimeout(() => setLocation("/dashboard/campaigns"), 500);
        } else {
          toast({ title: "Publish failed", description: "Could not save the campaign. Check your connection and try again.", variant: "destructive" });
        }
      } else {
        const created = await raceTimeout(createCampaign(data, user?.id || ""), 30000, "Campaign create") as ({ id: string } | null);
        if (created) {
          setSavedId(created.id);
          // Fire-and-forget: calendar sync
          if (user?.id) {
            syncCampaignDeliverablesToCalendar({ ...data, id: created.id }, user.id)
              .catch(e => console.warn("[calendar sync] background error:", e));
          }
          toast({ title: "Campaign published! 🎉", description: "Your campaign is now live." });
          window.dispatchEvent(new Event("vairal-campaigns-updated"));
          setTimeout(() => setLocation("/dashboard/campaigns"), 500);
        } else {
          toast({ title: "Publish failed", description: "Could not create the campaign. Check your connection and try again.", variant: "destructive" });
        }
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      toast({ title: "Publish error", description: msg, variant: "destructive" });
      console.error("[publish] error:", err);
    } finally {
      setIsPublishing(false);
      isSavingRef.current = false;
    }
  }, [campaign, savedId, toast, setLocation, user?.id]);


  const goNext = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!readOnly) {
      saveDraftQuietly().catch(e => console.error("Auto-save error", e));
    }
    if (step < 4) setStep(step + 1);
  };

  const goBack = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!readOnly) {
      saveDraftQuietly().catch(e => console.error("Auto-save error", e));
    }
    if (step > 1) setStep(step - 1);
  };

  const goToStep = (sNum: number) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!readOnly) {
      saveDraftQuietly().catch(e => console.error("Auto-save error", e));
    }
    setStep(sNum);
  };

  const goBackToList = async () => {
    try { await saveDraftQuietly(); } catch (e) { console.error("Auto-save error", e); }
    setLocation("/dashboard/campaigns");
  };

  const handleDeleteCampaign = async () => {
    if (!savedId) return;
    if (!confirm("Are you sure you want to delete this campaign? This cannot be undone.")) return;
    const success = await deleteCampaign(savedId);
    if (success) {
      toast({ title: "Campaign deleted" });
      setLocation("/dashboard/campaigns");
    } else {
      toast({ title: "Failed to delete campaign", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-full bg-[#f8f8ff]" data-testid="page-campaign-wizard">
      <aside className="hidden w-[280px] shrink-0 border-r border-[#eceefa] bg-white/72 p-8 md:flex md:flex-col">
        <button
          type="button"
          onClick={goBackToList}
          className="mb-12 flex items-center gap-2 text-left text-2xl font-black tracking-[0.16em] text-[#111936]"
          data-testid="button-back-to-campaigns"
        >
          VAIRAL <span className="text-[#7c5cff]">✦</span>
        </button>
        <nav className="space-y-5">
          {stepLabels.map((label, i) => {
            const sNum = i + 1;
            const isCurrent = step === sNum;
            const isCompleted = step > sNum;
            return (
              <button
                key={i}
                onClick={() => goToStep(sNum)}
                className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-[#f0edff] text-[#5f43dd] shadow-sm"
                    : isCompleted
                      ? "text-[#202946] hover:bg-[#f4f5fb]"
                      : "text-[#65708c] hover:bg-[#f4f5fb]"
                }`}
                data-testid={`button-step-${sNum}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCurrent
                    ? "bg-[#6f4df6] text-white"
                    : isCompleted
                      ? "bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100"
                      : "bg-[#f4f5fb] text-[#65708c]"
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : sNum}
                </span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[22px] border border-[#eceefa] bg-white/86 p-6 shadow-[0_18px_48px_rgba(31,41,55,0.05)]">
          <h3 className="text-sm font-bold text-[#5f43dd]">Need help?</h3>
          <p className="mt-3 text-sm leading-6 text-[#202946]">Our team is here to help you 24/7.</p>
          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 w-full rounded-xl border-[#e4e7f2] bg-white text-[#5f43dd] shadow-sm hover:bg-[#f8f8ff]"
          >
            <Headphones className="mr-2 h-4 w-4" /> Contact Support
          </Button>
          {readOnly && (
            <Badge className="mt-5 bg-emerald-50 text-emerald-600 border-emerald-100">Published</Badge>
          )}
          {savedId && !readOnly && (
            <Button
              variant="ghost"
              className="mt-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleDeleteCampaign}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Campaign
            </Button>
          )}
        </div>
      </aside>

      <main className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1640px] px-5 py-6 sm:px-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 flex items-center gap-3 md:hidden">
                <Button variant="ghost" size="sm" onClick={goBackToList} data-testid="button-back-mobile" className="rounded-xl text-[#65708c]">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <span className="text-sm font-semibold text-[#65708c]">Step {step} of 4</span>
              </div>
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#111936]" data-testid="text-step-title">
                {stepLabels[step - 1]}
              </h2>
              <p className="mt-2 text-sm font-medium text-[#65708c]">Step {step} of 4</p>
              <p className="mt-1 text-sm text-[#8a94ad]">{stepDescriptions[step - 1]}</p>
            </div>
            <div className="hidden items-center gap-7 lg:flex">
              {!readOnly && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-[#eceefa] bg-white px-5 py-3 text-sm font-semibold text-[#202946] shadow-sm">
                  <Cloud className="h-4 w-4 text-[#14b8a6]" /> Draft saved
                </span>
              )}
              <div className="relative h-28 w-52 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#f4efff] via-[#faf9ff] to-[#ebe5ff] opacity-80">
                <div className="absolute -right-3 top-4 h-24 w-24 rotate-[22deg] rounded-2xl border-8 border-[#c6b8ff] bg-white/50" />
                <Target className="absolute right-12 top-9 h-9 w-9 text-[#7c5cff]" />
                <Sparkles className="absolute left-11 top-11 h-5 w-5 text-[#9b87ff]" />
                <Check className="absolute left-24 top-[60px] h-4 w-4 text-[#7c5cff]" />
              </div>
            </div>
          </div>

          <Card className={`overflow-hidden rounded-[18px] p-0 ${wizardSurface}`}>
            {step === 1 && <Step1 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 2 && <Step2 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 3 && <Step3 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 4 && <Step4 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
          </Card>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 1} data-testid="button-back" className="h-11 rounded-xl border-[#e4e7f2] bg-white text-[#202946] shadow-sm disabled:opacity-40">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              {!readOnly && (
                <Button type="button" variant="outline" onClick={saveDraftAndExit} data-testid="button-save-draft" className="h-11 rounded-xl border-[#e4e7f2] bg-white text-[#202946] shadow-sm">
                  <Save className="w-4 h-4 mr-1" /> Save Draft
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={goNext} data-testid="button-next" className="h-11 rounded-xl bg-[#6f4df6] px-8 text-white shadow-[0_14px_28px_rgba(111,77,246,0.18)] hover:bg-[#5f43dd]">
                  Save & Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                !readOnly && (
                  <Button
                    type="button"
                    onClick={publish}
                    disabled={isPublishing}
                    className="h-11 rounded-xl bg-emerald-500 px-8 text-white shadow-[0_14px_28px_rgba(16,185,129,0.2)] hover:bg-emerald-600 disabled:opacity-70"
                    data-testid="button-publish"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" /> Publish Campaign
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
          {/* Draft auto-save status indicator */}
          {!readOnly && savedId && (
            <p className="text-xs text-[#8a94ad] text-center mt-2 opacity-70">Auto-saving…</p>
          )}
        </div>
      </main>
    </div>
  );
}

type StepProps = {
  campaign: any;
  updateField: (field: any, value: any) => void;
  readOnly: boolean;
};

function MultiSelect({ options, selected, onChange, disabled, testId }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; disabled?: boolean; testId?: string }) {
  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const platformVisual = platformVisuals[opt];
        const countryFlag = countryFlags[opt];
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              isSelected
                ? "border-[#b8a8ff] bg-[#f2efff] text-[#5f43dd] shadow-sm"
                : "border-[#e4e7f2] bg-white text-[#5b6683] hover:border-[#b8a8ff] hover:text-[#5f43dd]"
            } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            {platformVisual && <span className={platformVisual.color}>{platformVisual.icon}</span>}
            {countryFlag && <span>{countryFlag}</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TagsInput({ tags, onChange, placeholder, disabled, testId }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string; disabled?: boolean; testId?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v) && !disabled) {
      onChange([...tags, v]);
      setInput("");
    }
  };
  return (
    <div data-testid={testId}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
            {t}
            {!disabled && <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-400"><Trash2 className="w-3 h-3" /></button>}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={placeholder} className={`flex-1 ${wizardInputClass}`} />
          <Button type="button" variant="outline" size="sm" onClick={add} className="rounded-xl border-[#e4e7f2]"><Plus className="w-3 h-3" /></Button>
        </div>
      )}
    </div>
  );
}

function RepeatableList({ items, onChange, placeholder, disabled, testId }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string; disabled?: boolean; testId?: string }) {
  return (
    <div className="space-y-2" data-testid={testId}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} placeholder={placeholder} disabled={disabled} className={wizardInputClass} />
          {!disabled && items.length > 1 && (
            <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, j) => j !== i))} className="shrink-0 text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])} className="gap-1 rounded-xl border-[#e4e7f2]"><Plus className="w-3 h-3" /> Add</Button>
      )}
    </div>
  );
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold flex items-center gap-1 text-[#17213b]">
        {label} {required && <span className="text-[#f43f5e]">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Step1({ campaign, updateField, readOnly }: StepProps) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const parseDate = (d: string) => {
    if (!d) return { month: 0, day: 1, year: 2026 };
    const p = d.split("-");
    return { year: parseInt(p[0]), month: parseInt(p[1]) - 1, day: parseInt(p[2]) };
  };
  const makeDate = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

  const start = parseDate(campaign.startDate);
  const end = parseDate(campaign.endDate);

  const goalTemplates: Record<string, { platforms: string[], budget: number, desc: string }> = {
    "Brand Awareness": { platforms: ["Instagram", "TikTok"], budget: 10000, desc: "Reach a massive audience to build recognition." },
    "Product Launch": { platforms: ["Instagram", "YouTube", "TikTok"], budget: 25000, desc: "Drive hype for a new product release." },
    "Lead Generation": { platforms: ["LinkedIn", "Twitter/X"], budget: 5000, desc: "Collect emails and high-intent leads." },
    "Sales / Conversions": { platforms: ["Instagram", "TikTok"], budget: 15000, desc: "Direct response campaigns for e-commerce." },
    "Content Creation": { platforms: ["Instagram"], budget: 2000, desc: "UGC solely for your own organic channels." },
    "Event Promotion": { platforms: ["Instagram", "Snapchat"], budget: 5000, desc: "Hyping an upcoming physical or virtual event." },
    "App Installs": { platforms: ["TikTok", "Snapchat"], budget: 20000, desc: "Lower CPIs through native authentic creator hooks." },
    "Community Building": { platforms: ["Twitter/X", "YouTube"], budget: 3000, desc: "Foster deep brand loyalty and long-term fans." },
  };

  const handleGoalSelect = (g: string) => {
    if (readOnly) return;
    updateField("goal", g);
  };

  return (
    <div className="space-y-0">
      <div className="px-6 py-7 sm:px-8">
        <Label className="flex items-center gap-2 text-lg font-black text-[#111936]">
          1. Select Your Primary Goal <span className="text-[#f43f5e]">*</span>
          <span className="text-[#7c5cff]">✦</span>
        </Label>
        <p className="mb-5 mt-2 text-sm font-medium text-[#65708c]">Choose the main objective for your campaign.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {goals.map((g) => {
            const isSelected = campaign.goal === g;
            const t = goalTemplates[g] || { desc: "Custom objective", platforms: [], budget: 0 };
            const visual = goalVisuals[g] || goalVisuals["Brand Awareness"];
            const Icon = visual.icon;
            return (
              <div
                key={g}
                onClick={() => handleGoalSelect(g)}
                className={`relative flex min-h-[112px] gap-4 rounded-xl border p-4 text-left transition-all ${
                  readOnly ? "cursor-default opacity-80" : "cursor-pointer hover:border-[#b8a8ff] hover:shadow-[0_14px_32px_rgba(111,77,246,0.08)]"
                } ${isSelected ? "border-[#9b87ff] bg-[#fbfaff] shadow-sm ring-1 ring-[#b8a8ff]" : "border-[#e4e7f2] bg-white"}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${visual.tint}`}>
                  <Icon className={`h-5 w-5 ${visual.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className={`font-bold ${isSelected ? "text-[#111936]" : "text-[#17213b]"}`}>{g}</div>
                  <p className="mt-2 text-sm leading-6 text-[#65708c]">{t.desc}</p>
                </div>
                {isSelected && (
                  <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#6f4df6] text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#eceefa] px-6 py-7 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <FieldGroup label="Campaign Name" required>
            <Input value={campaign.name} onChange={(e) => updateField("name", e.target.value)} disabled={readOnly} placeholder="e.g. Summer 2026 Collection" className={wizardInputClass} />
          </FieldGroup>
          <FieldGroup label="Brand Name" required>
            <Input value={campaign.brand} onChange={(e) => updateField("brand", e.target.value)} disabled={readOnly} placeholder="Brand Name" className={wizardInputClass} />
          </FieldGroup>
        </div>

        <div className="mt-5">
          <FieldGroup label="Product or Service to Promote" required>
            <Input value={campaign.product} onChange={(e) => updateField("product", e.target.value)} disabled={readOnly} placeholder="What are the creators promoting?" className={wizardInputClass} />
          </FieldGroup>
        </div>

        <div className="mt-5">
          <FieldGroup label="Target Platform(s)" required>
            <MultiSelect options={platformOptions} selected={campaign.platforms} onChange={(v) => updateField("platforms", v)} disabled={readOnly} />
          </FieldGroup>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <FieldGroup label="Target Countr(ies)" required>
            <MultiSelect options={countries} selected={campaign.countries || []} onChange={(v) => updateField("countries", v)} disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Target Audience Age Range">
            <MultiSelect options={ageRanges} selected={campaign.audienceAgeRanges} onChange={(v) => updateField("audienceAgeRanges", v)} disabled={readOnly} />
          </FieldGroup>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <FieldGroup label="Total Budget" required>
            <div className="relative">
              <BadgeDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a94ad]" />
              <Input type="number" value={campaign.totalBudget || ""} onChange={(e) => updateField("totalBudget", parseFloat(e.target.value) || 0)} disabled={readOnly} placeholder="0.00" className={`${wizardInputClass} pl-9`} />
            </div>
          </FieldGroup>
          <FieldGroup label="Currency" required>
            <Select value={campaign.currency} onValueChange={(v) => updateField("currency", v)} disabled={readOnly}>
              <SelectTrigger className={wizardSelectTriggerClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <FieldGroup label="Start Date" required>
            <div className="flex gap-2">
              <Select value={String(start.month)} onValueChange={(v) => updateField("startDate", makeDate(start.year, parseInt(v), Math.min(start.day, daysInMonth(parseInt(v), start.year))))} disabled={readOnly}>
                <SelectTrigger className={`flex-1 ${wizardSelectTriggerClass}`}><Calendar className="mr-2 h-4 w-4 text-[#8a94ad]" /><SelectValue /></SelectTrigger>
                <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(start.day)} onValueChange={(v) => updateField("startDate", makeDate(start.year, start.month, parseInt(v)))} disabled={readOnly}>
                <SelectTrigger className={`w-[86px] ${wizardSelectTriggerClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: daysInMonth(start.month, start.year) }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(start.year)} onValueChange={(v) => updateField("startDate", makeDate(parseInt(v), start.month, Math.min(start.day, daysInMonth(start.month, parseInt(v)))))} disabled={readOnly}>
                <SelectTrigger className={`w-[104px] ${wizardSelectTriggerClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </FieldGroup>
          <FieldGroup label="End Date" required>
            <div className="flex gap-2">
              <Select value={String(end.month)} onValueChange={(v) => updateField("endDate", makeDate(end.year, parseInt(v), Math.min(end.day, daysInMonth(parseInt(v), end.year))))} disabled={readOnly}>
                <SelectTrigger className={`flex-1 ${wizardSelectTriggerClass}`}><Calendar className="mr-2 h-4 w-4 text-[#8a94ad]" /><SelectValue /></SelectTrigger>
                <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(end.day)} onValueChange={(v) => updateField("endDate", makeDate(end.year, end.month, parseInt(v)))} disabled={readOnly}>
                <SelectTrigger className={`w-[86px] ${wizardSelectTriggerClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: daysInMonth(end.month, end.year) }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={String(end.year)} onValueChange={(v) => updateField("endDate", makeDate(parseInt(v), end.month, Math.min(end.day, daysInMonth(end.month, parseInt(v)))))} disabled={readOnly}>
                <SelectTrigger className={`w-[104px] ${wizardSelectTriggerClass}`}><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {campaign.startDate && campaign.endDate && campaign.endDate <= campaign.startDate && (
              <p className="text-xs text-[#8b5cf6] mt-2">End date must be after start date</p>
            )}
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}

function MoodboardViewer({ items, onChange, readOnly }: { items: any[], onChange: (items: any[]) => void, readOnly: boolean }) {
  const [urlInput, setUrlInput] = useState("");

  const handleAdd = () => {
    if (!urlInput.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      url: urlInput.trim(),
    };
    onChange([...items, newItem]);
    setUrlInput("");
  };

  const remove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return 'link'; }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste a TikTok, Instagram, or YouTube URL..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            className={wizardInputClass}
          />
          <Button type="button" onClick={handleAdd} className="rounded-xl bg-[#6f4df6] hover:bg-[#5f43dd]">Add to Board</Button>
        </div>
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-2xl border border-[#e4e7f2] overflow-hidden bg-[#f8f8ff] aspect-[9/16] flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-[#f4f5fb] p-4 text-center">
                <span className="text-[#65708c] text-sm font-medium truncate w-full">{getDomain(item.url)}</span>
              </div>
              <div className="p-2 border-t border-[#e4e7f2] bg-white/95 backdrop-blur text-xs truncate">
                <a href={item.url} target="_blank" rel="noreferrer" className="text-[#5f43dd] hover:underline">{item.url}</a>
              </div>
              {!readOnly && (
                <button
                  onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 rounded-2xl border-2 border-dashed border-[#e4e7f2] flex items-center justify-center text-[#65708c] bg-[#f8f8ff]">
          <p className="text-sm">No inspiration links yet. Paste URLs above to build your moodboard.</p>
        </div>
      )}
    </div>
  );
}

function BriefForm({ brief, updateBrief, readOnly }: { brief: CampaignBrief, updateBrief: (f: keyof CampaignBrief, v: any) => void, readOnly: boolean }) {
  const addDeliverable = () => {
    const d: Deliverable = {
      id: crypto.randomUUID(),
      platform: "Instagram",
      contentType: "Reel",
      quantity: 1,
      formatNotes: "",
    };
    updateBrief("deliverables", [...brief.deliverables, d]);
  };

  const updateDeliverable = (i: number, field: keyof Deliverable, value: any) => {
    const deliverables = [...brief.deliverables];
    deliverables[i] = { ...deliverables[i], [field]: value };
    updateBrief("deliverables", deliverables);
  };

  const removeDeliverable = (i: number) => {
    updateBrief("deliverables", brief.deliverables.filter((_: any, j: number) => j !== i));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FieldGroup label="Brief Title" required>
          <Input value={brief.title} onChange={(e) => updateBrief("title", e.target.value)} disabled={readOnly} placeholder="e.g. Phase 1: Teaser" className={wizardInputClass} />
        </FieldGroup>

        <FieldGroup label="Visual Moodboard">
          <p className="text-xs text-muted-foreground mb-2">Paste links to TikToks, Reels, or Shorts that show the vibe you want.</p>
          <MoodboardViewer items={brief.moodboard || []} onChange={(v) => updateBrief("moodboard", v)} readOnly={readOnly} />
        </FieldGroup>

        <FieldGroup label="Key Messages" required>
          <RepeatableList items={brief.keyMessages.length ? brief.keyMessages : [""]} onChange={(v) => updateBrief("keyMessages", v)} placeholder="Key message..." disabled={readOnly} />
        </FieldGroup>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Do's">
            <RepeatableList items={brief.dos?.length ? brief.dos : [""]} onChange={(v) => updateBrief("dos", v)} placeholder="Do..." disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Don'ts">
            <RepeatableList items={brief.donts?.length ? brief.donts : [""]} onChange={(v) => updateBrief("donts", v)} placeholder="Don't..." disabled={readOnly} />
          </FieldGroup>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Hashtags">
            <TagsInput tags={brief.hashtags || []} onChange={(v) => updateBrief("hashtags", v)} placeholder="#hashtag" disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Mentions / Tags">
            <TagsInput tags={brief.mentions || []} onChange={(v) => updateBrief("mentions", v)} placeholder="@mention" disabled={readOnly} />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-base border-b border-[#eceefa] pb-3 mt-6 text-[#111936]">Deliverables for this Brief</h3>
        {brief.deliverables.map((d: Deliverable, i: number) => (
          <Card key={d.id} className="p-5 bg-[#f8f8ff] border-[#eceefa] space-y-4 shadow-none rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Content Unit {i + 1}</p>
              {!readOnly && (
                <Button variant="ghost" size="icon" onClick={() => removeDeliverable(i)} className="text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <FieldGroup label="Platform" required>
                <Select value={d.platform} onValueChange={(v) => updateDeliverable(i, "platform", v)} disabled={readOnly}>
                  <SelectTrigger className={wizardSelectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent>{platformOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup label="Content Format" required>
                <Select value={d.contentType} onValueChange={(v) => updateDeliverable(i, "contentType", v)} disabled={readOnly}>
                  <SelectTrigger className={wizardSelectTriggerClass}><SelectValue /></SelectTrigger>
                  <SelectContent>{contentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup label="Quantity" required>
                <Input type="number" value={d.quantity || ""} onChange={(e) => updateDeliverable(i, "quantity", parseInt(e.target.value) || 1)} disabled={readOnly} min={1} className={wizardInputClass} />
              </FieldGroup>
            </div>
            <FieldGroup label="Content Details / Notes">
              <Textarea value={d.formatNotes} onChange={(e) => updateDeliverable(i, "formatNotes", e.target.value)} disabled={readOnly} placeholder="e.g. Include 9:16 ratio, hook in first 2 seconds" rows={2} className="rounded-xl border-[#e4e7f2] bg-white text-[#17213b] placeholder:text-[#8a94ad]" />
            </FieldGroup>
          </Card>
        ))}
        {!readOnly && (
          <Button variant="outline" onClick={addDeliverable} className="gap-1 w-full border-dashed rounded-xl border-[#b8a8ff] text-[#5f43dd] hover:bg-[#f2efff]" data-testid="button-add-deliverable">
            <Plus className="w-4 h-4" /> Add Deliverable
          </Button>
        )}
      </div>
    </div>
  );
}

function Step2({ campaign, updateField, readOnly }: StepProps) {
  const briefs = campaign.briefs || [];
  const [activeTab, setActiveTab] = useState<string>(briefs[0]?.id || "");

  // Sync active tab if it's invalid
  useEffect(() => {
    if (briefs.length > 0 && !briefs.find((b: CampaignBrief) => b.id === activeTab)) {
      setActiveTab(briefs[0].id);
    }
  }, [briefs, activeTab]);

  const addBrief = () => {
    const newBrief: CampaignBrief = {
      id: crypto.randomUUID(),
      title: `Brief ${briefs.length + 1}`,
      keyMessages: [""],
      dos: [""],
      donts: [""],
      hashtags: [],
      mentions: [],
      referenceLinks: [""],
      deliverables: [],
    };
    updateField("briefs", [...briefs, newBrief]);
    setActiveTab(newBrief.id);
  };

  const updateBrief = (i: number, field: keyof CampaignBrief, value: any) => {
    const newBriefs = [...briefs];
    newBriefs[i] = { ...newBriefs[i], [field]: value };
    updateField("briefs", newBriefs);
  };

  const removeBrief = (i: number) => {
    const briefId = briefs[i].id;
    const newBriefs = briefs.filter((_: any, j: number) => j !== i);
    updateField("briefs", newBriefs);
    if (activeTab === briefId && newBriefs.length > 0) {
      setActiveTab(newBriefs[0].id);
    }
  };

  return (
    <div className="space-y-6 px-6 py-7 sm:px-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 border-b border-[#eceefa] pb-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0 justify-start">
            {briefs.map((b: CampaignBrief, i: number) => (
              <TabsTrigger
                key={b.id}
                value={b.id}
                className="data-[state=active]:bg-[#f2efff] data-[state=active]:text-[#5f43dd] data-[state=active]:border-[#b8a8ff] border border-[#e4e7f2] rounded-full px-5 py-2 transition-all text-[#65708c]"
              >
                {b.title || `Brief ${i + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={addBrief} className="whitespace-nowrap rounded-xl border-[#e4e7f2] bg-white text-[#5f43dd] shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Brief
            </Button>
          )}
        </div>

        {briefs.map((brief: CampaignBrief, i: number) => (
          <TabsContent key={brief.id} value={brief.id} className="mt-0 outline-none space-y-6 rounded-[18px] border border-[#eceefa] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eceefa] pb-3 mb-4">
              <h3 className="font-black text-lg text-[#111936]">{brief.title || `Brief ${i + 1}`}</h3>
              {!readOnly && briefs.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeBrief(i)} className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-1" /> Remove Brief
                </Button>
              )}
            </div>
            <BriefForm brief={brief} updateBrief={(field, value) => updateBrief(i, field, value)} readOnly={readOnly} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
function Step3({ campaign, updateField, readOnly }: StepProps) {
  const { toast } = useToast();
  const prefetched = usePrefetchedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBriefs, setExpandedBriefs] = useState<Record<string, boolean>>({});
  const [globalContentTarget, setGlobalContentTarget] = useState<number>(0);
  const [selectedListId, setSelectedListId] = useState<string>("none");

  const [localLists, setLocalLists] = useState<any[]>([]);
  useEffect(() => {
    if (prefetched.lists.length > 0) {
      setLocalLists(prefetched.lists);
    } else {
      import("@/services/api/lists").then(({ fetchLists }) => {
        // Safe fallback since user is not in scope for Step3
        fetchLists("").then(setLocalLists);
      });
    }
  }, [prefetched.lists]);

  const toggleBrief = (id: string) => setExpandedBriefs(prev => ({ ...prev, [id]: !prev[id] }));

  const handleListSelection = async (listId: string) => {
    setSelectedListId(listId);
    if (listId === "none") return;

    // Resolve list name from state
    const cachedList = localLists.find((l: any) => l.id === listId);
    let listName = cachedList?.name || "";

    try {
      const { fetchListMembers, getListById } = await import("@/services/api/lists");

      // If name wasn't in cache, fetch it from DB
      if (!listName) {
        const listData = await getListById(listId);
        listName = listData?.name || "Selected List";
      }

      const members = await fetchListMembers(listId);

      if (!members || members.length === 0) {
        toast({ title: "Empty List", description: `List "${listName}" has no creators yet. Add some from the Discover or Lists page.` });
        setSelectedListId("none");
        return;
      }

      const existingIds = new Set(campaign.selectedCreators.map((c: any) => c.creatorId));
      const newCreators = members
        .filter((m: any) => !existingIds.has(m.creator_username))
        .map((m: any) => ({ creatorId: m.creator_username, status: "Confirmed", deliverables: [] }));

      if (newCreators.length > 0) {
        updateField("selectedCreators", [...campaign.selectedCreators, ...newCreators]);
        toast({
          title: "Creators Added",
          description: `Added ${newCreators.length} creator${newCreators.length !== 1 ? "s" : ""} from list "${listName}". ${existingIds.size > 0 ? "Combined with your existing shortlist." : ""}`,
        });
      } else {
        toast({
          title: "Already Shortlisted",
          description: `All ${members.length} creators from "${listName}" are already in your shortlist.`,
        });
      }
    } catch (err: any) {
      toast({ title: "Failed to load list", description: err?.message || "Could not fetch list members. Please try again.", variant: "destructive" });
    } finally {
      setSelectedListId("none");
    }
  };

  const [isAllocating, setIsAllocating] = useState(false);

  const autoAllocate = async () => {
    if (campaign.selectedCreators.length === 0 || globalContentTarget <= 0) return;

    setIsAllocating(true);
    await new Promise(r => setTimeout(r, 600));

    // Build a map of brief templates: each brief deliverable knows which brief it belongs to
    const briefDeliverablesWithBrief = campaign.briefs?.flatMap((b: any) =>
      (b.deliverables || []).map((d: any) => ({ ...d, briefId: b.id }))
    ) || [];

    const baseCount = Math.floor(globalContentTarget / campaign.selectedCreators.length);
    let remainder = globalContentTarget % campaign.selectedCreators.length;

    const newList = campaign.selectedCreators.map((c: any) => {
      const creatorCount = baseCount + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      const newDeliverables = Array.from({ length: creatorCount }).map((_, i) => {
        const template = briefDeliverablesWithBrief.length > 0 ? briefDeliverablesWithBrief[i % briefDeliverablesWithBrief.length] : null;
        return {
          id: crypto.randomUUID(),
          platform: template?.platform || "Instagram",
          contentType: template?.contentType || "Reel",
          contentDetails: template?.formatNotes || `Auto-allocated content unit`,
          status: "Not Started",
          briefId: template?.briefId || "",  // ← properly links to brief
        };
      });

      return { ...c, deliverables: newDeliverables };
    });

    updateField("selectedCreators", newList);
    setIsAllocating(false);
    toast({
      title: "Content Allocated",
      description: `Successfully allocated ${globalContentTarget} items across ${campaign.selectedCreators.length} creators.`
    });
  };

  const totalDeliverables = campaign.briefs?.reduce((acc: number, b: any) => acc + (b.deliverables || []).reduce((a: number, d: any) => a + (d.quantity || 1), 0), 0) || 0;
  const totalKeyMessages = campaign.briefs?.reduce((acc: number, b: any) => acc + (b.keyMessages || []).filter(Boolean).length, 0) || 0;

  const filteredCreators = creatorsData.filter((c) => {
    if (searchQuery && !(c.fullname || "").toLowerCase().includes(searchQuery.toLowerCase()) && !c.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const addToShortlist = (id: string) => {
    if (!campaign.selectedCreators.some((c: any) => c.creatorId === id)) {
      updateField("selectedCreators", [...campaign.selectedCreators, { creatorId: id, status: "Confirmed", deliverables: [] }]);
    }
  };
  const removeFromShortlist = (id: string) => {
    updateField("selectedCreators", campaign.selectedCreators.filter((c: any) => c.creatorId !== id));
  };

  const currencyObj = currencies.find((c) => c.code === campaign.currency);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">{title}</h4>
      {children}
    </div>
  );

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[60%] font-medium">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-8 px-6 py-7 sm:px-8">
      <div className="space-y-4">
        <h3 className="font-black text-lg text-[#111936]">Creator Selection</h3>
        <p className="text-sm text-[#65708c]">Select creators for this campaign from your database. You can also finalize this later.</p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a94ad]" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search creators..." className={`${wizardInputClass} pl-9`} disabled={readOnly} />
          </div>
          <Select disabled={readOnly} value={selectedListId} onValueChange={handleListSelection}>
            <SelectTrigger className={`w-full sm:w-[240px] ${wizardSelectTriggerClass}`}>
              <SelectValue placeholder="Add from List..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>Select a list</SelectItem>
              {localLists.map((list: any) => (
                <SelectItem key={list.id} value={list.id}>{list.name} ({list.member_count || 0})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto border border-[#eceefa] rounded-2xl max-h-[280px] overflow-y-auto bg-white shadow-sm">
          <table className="w-full relative">
            <thead className="sticky top-0 bg-[#f8f8ff]/95 backdrop-blur z-10">
              <tr className="border-b border-[#eceefa]">
                <th className="text-left text-xs font-bold text-[#65708c] p-3">Creator</th>
                <th className="text-left text-xs font-bold text-[#65708c] p-3">Platform</th>
                <th className="text-left text-xs font-bold text-[#65708c] p-3">Followers</th>
                <th className="text-right text-xs font-bold text-[#65708c] p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCreators.slice(0, 15).map((creator) => {
                const isSelected = campaign.selectedCreators.some((c: any) => c.creatorId === creator.username);
                return (
                  <tr key={creator.username} className="border-b border-[#eceefa] last:border-0 hover:bg-[#f8f8ff]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <CreatorAvatar
                          username={creator.username}
                          name={creator.fullname || creator.username}
                          className="w-9 h-9 rounded-full object-cover bg-muted shrink-0"
                          fallbackClassName="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#17213b] truncate">{creator.fullname || creator.username}</p>
                          <p className="text-xs text-[#65708c]">@{creator.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[#65708c]">{creator.channel}</td>
                    <td className="p-3 text-sm text-[#65708c]">{(creator.followers || 0).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {!readOnly && (
                        isSelected ? (
                          <Button variant="ghost" size="sm" onClick={() => removeFromShortlist(creator.username)} className="text-emerald-500 gap-1 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl">
                            <Check className="w-3 h-3" /> Added
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => addToShortlist(creator.username)} className="gap-1 rounded-xl border-[#e4e7f2] text-[#5f43dd]">
                            <UserPlus className="w-3 h-3" /> Add
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {campaign.selectedCreators.length > 0 && (
          <div className="space-y-6 mt-6 mb-20">


            <div className="p-5 rounded-2xl bg-white border border-[#eceefa] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-black text-[#111936]">Shortlisted Creators ({campaign.selectedCreators.length})</p>


              </div>

            <div className="space-y-3">
                {campaign.selectedCreators.map((cc: any) => {
                const id = cc.creatorId;
                const creatorObj = creatorsData.find((cr) => cr.username === id);
                return (
                  <div key={id} className={`flex flex-col gap-3 p-4 bg-muted/20 border ${isAllocating ? 'opacity-50 pointer-events-none' : ''} border-border/60 hover:border-border rounded-xl transition-all shadow-sm`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                         <CreatorAvatar
                           username={id}
                           name={creatorObj?.fullname || creatorObj?.username || id}
                           className="w-9 h-9 rounded-full object-cover bg-muted shrink-0"
                           fallbackClassName="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0"
                         />
                         <div>
                            <p className="text-sm font-bold text-foreground">{creatorObj?.fullname || creatorObj?.username || id}</p>
                            <p className="text-xs text-muted-foreground font-mono">@{id}</p>
                         </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {!readOnly && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0 transition-colors" onClick={() => removeFromShortlist(id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Deliverables Sub-Section */}
                    <div className="mt-2 pl-4 border-l-2 border-border/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deliverables</p>
                          {!readOnly && (
                            <Button variant="outline" size="sm" className="h-7 text-xs bg-muted/30" onClick={() => {
                                const newDeliverable = {
                                  id: crypto.randomUUID(),
                                  platform: "",
                                  contentType: "",
                                  contentDetails: "",
                                  status: "Not Started",
                                };
                              const newList = campaign.selectedCreators.map((c: any) =>
                                c.creatorId === id ? { ...c, deliverables: [...(c.deliverables || []), newDeliverable] } : c
                              );
                              updateField("selectedCreators", newList);
                            }}>
                              <Plus className="w-3 h-3 mr-1" /> Add Deliverable
                            </Button>
                          )}
                        </div>

                        {(cc.deliverables || []).length > 0 ? (
                          <div className="space-y-2">
                            <div className="hidden lg:grid grid-cols-[1fr_1fr_1.5fr_2fr_1fr_1fr_1.5fr_auto] gap-2 px-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              <div>Platform</div>
                              <div>Format</div>
                              <div>Brief</div>
                              <div>Details</div>
                              <div>Shoot Due</div>
                              <div>Go Live</div>
                              <div>Status</div>
                              <div className="w-8"></div>
                            </div>
                            {(cc.deliverables || []).map((deliv: any, idx: number) => (
                              <div key={deliv.id || idx} className="grid lg:grid-cols-[1fr_1fr_1.5fr_2fr_1fr_1fr_1.5fr_auto] sm:grid-cols-2 gap-2 items-start bg-muted/10 p-2 rounded-md border border-border/50">

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Platform</label>
                                  <Select
                                    value={deliv.platform}
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, platform: v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Platform" /></SelectTrigger>
                                    <SelectContent>
                                      {platformOptions.map(p => (
                                          <SelectItem key={p} value={p}>{p}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Format</label>
                                  <Select
                                    value={deliv.contentType}
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, contentType: v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Format" /></SelectTrigger>
                                    <SelectContent>
                                      {contentTypes.map(c => (
                                          <SelectItem key={c} value={c}>{c}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Brief <span className="text-red-400">*</span></label>
                                  <Select
                                    value={deliv.briefId || "none"}
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, briefId: v === "none" ? "" : v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className={`h-8 text-xs ${!deliv.briefId ? 'border-red-400/50 bg-red-400/5' : ''}`}>
                                      <SelectValue placeholder="Select Brief *" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Brief</SelectItem>
                                      {(campaign.briefs || []).map((b: any) => (
                                          <SelectItem key={b.id} value={b.id}>{b.title || 'Untitled Brief'}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Details</label>
                                  <Input
                                    placeholder="Details / Description"
                                    className="h-8 text-xs"
                                    value={deliv.contentDetails || ""}
                                    onChange={(e) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, contentDetails: e.target.value } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Shoot Due</label>
                                  <Input
                                    type="date"
                                    className="h-8 text-xs"
                                    value={deliv.submitShootBefore || ""}
                                    onChange={(e) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, submitShootBefore: e.target.value } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Go Live</label>
                                  <Input
                                    type="date"
                                    className="h-8 text-xs"
                                    value={deliv.goLiveOn || ""}
                                    onChange={(e) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, goLiveOn: e.target.value } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>

                                <div className="flex flex-col gap-1 min-w-[120px]">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Status</label>
                                  <Select
                                    value={deliv.status}
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) =>
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, status: v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className={`h-8 text-[10px] font-bold ${
                                      deliv.status === 'Approved & Scheduled' || deliv.status === 'Live' ? 'bg-green-600 text-white border-green-700' :
                                      deliv.status === 'Shoot Submitted' ? 'bg-blue-600 text-white border-blue-700' :
                                      deliv.status === 'Changes Requested' ? 'bg-red-600 text-white border-red-700' :
                                      'bg-card border-border'
                                    }`}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Not Started" className="text-xs">Not Started</SelectItem>
                                      <SelectItem value="Awaiting Shoot" className="text-xs">Awaiting Shoot</SelectItem>
                                      <SelectItem value="Shoot Submitted" className="text-xs">Shoot Submitted</SelectItem>
                                      <SelectItem value="Changes Requested" className="text-xs">Changes Requested</SelectItem>
                                      <SelectItem value="Approved & Scheduled" className="text-xs">Approved & Scheduled</SelectItem>
                                      <SelectItem value="Live" className="text-xs">Live</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {!readOnly && (
                                  <div className="flex flex-col gap-1 items-end justify-center h-full">
                                    <label className="text-[10px] opacity-0 leading-none lg:block hidden">Action</label>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0 self-end lg:self-auto"
                                      onClick={() => {
                                        const newList = campaign.selectedCreators.map((c: any) =>
                                          c.creatorId === id ? { ...c, deliverables: c.deliverables.filter((d: any) => d.id !== deliv.id) } : c
                                        );
                                        updateField("selectedCreators", newList);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic px-2">No deliverables added yet.</div>
                        )}

                      </div>
                  </div>
                );
              })}
            </div>

          </div>
          </div>
        )}
      </div>

    </div>
  );
}

export function Step4({ campaign, updateField, readOnly }: StepProps) {
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const [expandedBriefs, setExpandedBriefs] = useState<Record<string, boolean>>({});
  const toggleBrief = (id: string) => setExpandedBriefs(prev => ({ ...prev, [id]: !prev[id] }));

  const Section = ({ title, editStep, children, info }: { title: string; editStep?: number; children: React.ReactNode; info?: boolean }) => (
    <div className={`space-y-4 rounded-2xl border ${info ? 'bg-slate-50 border-slate-200' : 'bg-white border-[#eceefa]'} p-6 shadow-sm`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {editStep && (
          <button 
            type="button"
            onClick={() => setLocation(`/dashboard/campaigns/wizard?id=${campaign.id}&step=${editStep}&returnTo=4`)}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            Edit <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );

  const totalDeliverables = campaign.selectedCreators?.reduce((acc: number, c: any) => acc + (c.deliverables?.length || 0), 0) || 0;
  
  // Calculate platform breakdown
  const platforms = new Set<string>();
  campaign.selectedCreators?.forEach((c: any) => {
    c.deliverables?.forEach((d: any) => platforms.add(d.platform));
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-6 py-8 sm:px-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#111936]">Review & Publish</h2>
        <p className="text-sm text-[#65708c] mt-1">One final look before your campaign goes live. You can still make changes — just click Edit on any section.</p>
      </div>

      {/* Section 1 - Campaign Basics */}
      <Section title="Campaign Basics" editStep={1}>
        <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
          <div className="text-[#65708c] font-medium">Goal</div>
          <div className="text-[#111936] font-medium">{campaign.goal || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Campaign Name</div>
          <div className="text-[#111936] font-medium">{campaign.name || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Brand</div>
          <div className="text-[#111936] font-medium">{campaign.brand || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Product</div>
          <div className="text-[#111936] font-medium">{campaign.product || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Platforms</div>
          <div className="text-[#111936] font-medium">{(campaign.platforms || []).join(" · ") || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Countries</div>
          <div className="text-[#111936] font-medium">{(campaign.countries || []).join(" · ") || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Audience</div>
          <div className="text-[#111936] font-medium">{(campaign.targetAudience || []).join(" · ") || "—"}</div>
          
          <div className="text-[#65708c] font-medium">Total Budget</div>
          <div className="text-[#111936] font-medium">{campaign.currency || "AED"} {campaign.totalBudget?.toLocaleString() || "0"}</div>
          
          <div className="text-[#65708c] font-medium">Flight Dates</div>
          <div className="text-[#111936] font-medium">{campaign.startDate || "—"} → {campaign.endDate || "—"}</div>
        </div>
      </Section>

      {/* Section 2 - Briefs */}
      <Section title={`Briefs (${campaign.briefs?.length || 0})`} editStep={2}>
        <div className="space-y-3">
          {(campaign.briefs || []).map((brief: any, idx: number) => {
            const isExpanded = expandedBriefs[brief.id];
            return (
              <div key={brief.id} className="border border-[#eceefa] rounded-xl overflow-hidden">
                <button 
                  type="button"
                  onClick={() => toggleBrief(brief.id)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <span className="font-bold text-[#111936] text-sm">Brief {idx + 1} · {brief.title}</span>
                  </div>
                  <div className="text-sm text-[#65708c]">
                    {(brief.keyMessages || []).filter(Boolean).length} key messages · {(brief.moodboardUrls || []).length} moodboard items
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-4 bg-slate-50/50 border-t border-[#eceefa] space-y-4 text-sm">
                    {brief.moodboardUrls?.length > 0 && (
                      <div className="flex gap-2">
                        {brief.moodboardUrls.map((url: string, i: number) => (
                          <div key={i} className="w-16 h-16 rounded bg-slate-200 overflow-hidden flex items-center justify-center">
                            <span className="text-xs text-slate-400">Img</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-slate-700 mb-1">Key Messages</h5>
                      <ul className="list-disc pl-5 space-y-1 text-[#65708c]">
                        {brief.keyMessages?.map((msg: string, i: number) => msg && <li key={i}>{msg}</li>)}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-bold text-emerald-700 mb-1">Do's</h5>
                        <ul className="list-disc pl-5 space-y-1 text-[#65708c]">
                          {brief.dos?.map((d: string, i: number) => d && <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-bold text-red-700 mb-1">Don'ts</h5>
                        <ul className="list-disc pl-5 space-y-1 text-[#65708c]">
                          {brief.donts?.map((d: string, i: number) => d && <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    </div>
                    {(brief.hashtags?.length > 0 || brief.mentions?.length > 0) && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {brief.hashtags?.map((h: string, i: number) => <span key={i} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs">#{h.replace('#','')}</span>)}
                        {brief.mentions?.map((m: string, i: number) => <span key={i} className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs">@{m.replace('@','')}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {(!campaign.briefs || campaign.briefs.length === 0) && (
            <div className="text-sm text-[#65708c] italic">No briefs created.</div>
          )}
        </div>
      </Section>

      {/* Section 3 - Creators & Deliverables */}
      <Section title="Creators & Deliverables" editStep={3}>
        <p className="text-sm text-[#65708c] mb-4">
          {campaign.selectedCreators?.length || 0} creators · {totalDeliverables} deliverables across {Array.from(platforms).length} platforms
        </p>
        <div className="rounded-xl border border-[#eceefa] overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f4f5fb] border-b border-[#eceefa]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#65708c]">Creator</th>
                <th className="px-4 py-3 font-semibold text-[#65708c]">Platform</th>
                <th className="px-4 py-3 font-semibold text-[#65708c]">Format</th>
                <th className="px-4 py-3 font-semibold text-[#65708c]">Brief</th>
                <th className="px-4 py-3 font-semibold text-[#65708c]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceefa] bg-white">
              {(campaign.selectedCreators || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#65708c] italic">
                    No deliverables assigned yet
                  </td>
                </tr>
              ) : (
                campaign.selectedCreators?.map((c: any) => {
                  if (!c.deliverables || c.deliverables.length === 0) {
                    return (
                      <tr key={c.creatorId}>
                        <td className="px-4 py-3 font-medium text-[#111936] flex items-center gap-2">
                          <CreatorAvatar username={c.creatorId} name={c.creatorId} className="w-6 h-6 rounded-full" />
                          {c.creatorId}
                        </td>
                        <td colSpan={4} className="px-4 py-3 text-[#65708c] italic">
                          No deliverables assigned yet
                        </td>
                      </tr>
                    );
                  }
                  
                  return c.deliverables.map((d: any, idx: number) => {
                    const briefIndex = campaign.briefs?.findIndex((b: any) => b.id === d.briefId);
                    const briefLabel = briefIndex >= 0 ? `Brief ${briefIndex + 1}` : "—";
                    return (
                      <tr key={`${c.creatorId}-${d.id || idx}`} className="hover:bg-[#f4f5fb]/50">
                        <td className="px-4 py-3 font-medium text-[#111936] flex items-center gap-2">
                          <CreatorAvatar username={c.creatorId} name={c.creatorId} className="w-6 h-6 rounded-full" />
                          {c.creatorId}
                        </td>
                        <td className="px-4 py-3 text-[#65708c]">{d.platform}</td>
                        <td className="px-4 py-3 text-[#65708c]">{d.contentType}</td>
                        <td className="px-4 py-3 text-[#65708c]">{briefLabel}</td>
                        <td className="px-4 py-3 text-[#65708c] truncate max-w-[200px]" title={d.notes || "—"}>{d.notes || "—"}</td>
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section 4 - What happens when you publish */}
      <Section title="What happens when you publish" info>
        <ul className="list-disc pl-5 space-y-2 text-sm text-[#65708c]">
          <li>Your campaign status changes from Draft to <strong className="text-[#111936]">Active</strong></li>
          <li><strong className="text-[#111936]">{totalDeliverables} deliverable cards</strong> will be created on the Deliverables Board, all starting in the <strong className="text-[#111936]">Not Started</strong> phase</li>
          <li>Target go-live date defaults to <strong className="text-[#111936]">{campaign.endDate || 'Flight End date'}</strong> for every deliverable — you can adjust individual dates later from the Deliverables Board</li>
          <li>You'll be taken to the Campaign Workspace so you can start moving work forward</li>
        </ul>
      </Section>
    </div>
  );
}

export default function CampaignWizard() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" /></div>}>
      <CampaignWizardContent />
    </Suspense>
  );
}
