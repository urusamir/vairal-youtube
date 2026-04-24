"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Campaign,
  getCampaignAsync,
  updateCampaign,
  updateCampaignStatus,
} from "@/models/campaign.types";
import { useAuth } from "@/providers/auth.provider";
import { FeaturePageHeader } from "@/components/layout/feature-page-header";
import { DeliverablesBoard } from "./deliverables-board";
import { CreatorRoster } from "./creator-roster";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Target,
  LayoutDashboard,
  Users,
  FolderOpen,
  PowerOff,
  MoreVertical,
  Edit,
  CheckCircle2,
  Clock,
  Briefcase,
} from "lucide-react";
import { CreatorAvatar } from "@/components/creators/creator-avatar";
import { useToast } from "@/hooks/use-toast";

export default function CampaignWorkspace() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockFiles, setMockFiles] = useState<{name: string, size: string, date: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshCampaigns = () => {
    if (!id) return;
    getCampaignAsync(id, user?.id).then((c) => {
      setCampaign(c || null);
    });
  };

  useEffect(() => {
    if (!id) return;
    getCampaignAsync(id, user?.id).then((c) => {
      setCampaign(c || null);
      setLoading(false);
    });
  }, [id, user?.id]);

  const handleStatusChange = async (newStatus: "DRAFT" | "FINISHED" | "PUBLISHED") => {
    if (!campaign) return;
    const success = await updateCampaignStatus(campaign.id, newStatus);
    if (success) {
      setCampaign({ ...campaign, status: newStatus });
      toast({ title: `Campaign status changed to ${newStatus}` });
    } else {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      setMockFiles(prev => [...prev, {
        name: file.name,
        size: sizeStr,
        date: new Date().toLocaleDateString()
      }]);
      
      toast({ 
        title: "File Uploaded", 
        description: `Successfully uploaded ${file.name}` 
      });
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Campaign not found</h2>
        <Button onClick={() => router.push("/dashboard/campaigns")} className="mt-4">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50" data-testid="page-campaign-workspace">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => router.push("/dashboard/campaigns")}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {campaign.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-violet-500" />
                {campaign.brand}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4 text-emerald-500" />
                {campaign.goal}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                campaign.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-700"
                  : campaign.status === "FINISHED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {campaign.status === "PUBLISHED" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : campaign.status === "FINISHED" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <PowerOff className="h-3.5 w-3.5" />
              )}
              {campaign.status}
            </span>

            {campaign.status !== "FINISHED" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("FINISHED")}>
                Mark Finished
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/campaigns/wizard?id=${campaign.id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit details
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6 sm:p-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 h-12 bg-white p-1 border shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" /> Creators
            </TabsTrigger>
            <TabsTrigger value="briefs" className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" /> Briefs
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4" /> Deliverables
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <FolderOpen className="h-4 w-4" /> Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {/* Total Budget */}
              <Card className="relative overflow-hidden p-5 shadow-sm border-slate-100 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-500">Total Budget</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {campaign.currency} {campaign.totalBudget.toLocaleString()}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-emerald-100/50 to-transparent">
                  <svg className="absolute bottom-0 w-full h-8 text-emerald-400" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,100 L0,50 Q25,20 50,60 T100,20 L100,100 Z" fill="currentColor" fillOpacity="0.2" />
                    <path d="M0,50 Q25,20 50,60 T100,20" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="relative overflow-hidden p-5 shadow-sm border-slate-100 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-500">Timeline</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-2">
                    {campaign.startDate} to {campaign.endDate}
                  </div>
                </div>
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500 w-[60%]" />
                  </div>
                </div>
              </Card>

              {/* Selected Creators */}
              <Card className="relative overflow-hidden p-5 shadow-sm border-slate-100 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-500">Selected Creators</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {campaign.selectedCreators?.length || 0}
                  </div>
                </div>
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {campaign.selectedCreators?.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.creatorId}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {(campaign.selectedCreators?.length || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        +{(campaign.selectedCreators?.length || 0) - 3}
                      </div>
                    )}
                  </div>
                  <button onClick={() => router.push(`/dashboard/campaigns/wizard?id=${campaign.id}&step=3`)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                    <span className="text-lg font-light leading-none">+</span>
                  </button>
                </div>
              </Card>

              {/* Briefs */}
              <Card className="relative overflow-hidden p-5 shadow-sm border-slate-100 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-white to-amber-50/30">
                <div className="relative z-10">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-500">Briefs</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <FileText className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {campaign.briefs?.length || 0}
                  </div>
                </div>
                <img 
                  src="/images/campaigns/icon_briefs_1777029977791.png" 
                  alt="Briefs" 
                  className="absolute -bottom-4 -right-4 w-28 h-28 object-contain opacity-90 transition-transform hover:scale-110"
                />
              </Card>

              {/* Deliverables */}
              <Card className="relative overflow-hidden p-5 shadow-sm border-slate-100 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-white to-blue-50/30">
                <div className="relative z-10">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-500">Deliverables</h3>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {campaign.deliverables?.length || 0}
                  </div>
                </div>
                <img 
                  src="/images/campaigns/icon_deliverables_1777029993966.png" 
                  alt="Deliverables" 
                  className="absolute -bottom-4 -right-4 w-28 h-28 object-contain opacity-90 transition-transform hover:scale-110"
                />
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 p-8 shadow-sm border-slate-100 flex flex-col justify-center relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 text-violet-600">
                    <Target className="h-5 w-5" />
                  </div>
                  Campaign Objective
                </h3>
                <p className="text-lg text-slate-700 leading-relaxed mb-8 relative z-10 max-w-3xl">
                  We are promoting <span className="font-bold text-slate-900">{campaign.product}</span> for <span className="font-bold text-slate-900">{campaign.brand}</span>.
                  The primary goal is to drive <span className="font-bold text-violet-600">{campaign.goal}</span> across targeted digital platforms.
                </p>
                <div className="flex flex-wrap gap-3 relative z-10">
                  {campaign.platforms.map((p) => (
                    <span key={p} className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 transition-colors cursor-default">
                      {p}
                    </span>
                  ))}
                  {campaign.countries?.map((c) => (
                    <span key={c} className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-200 transition-colors cursor-default">
                      {c}
                    </span>
                  ))}
                </div>
              </Card>

              <Card className="p-0 shadow-sm border-slate-100 overflow-hidden relative group h-[300px] lg:h-auto">
                {campaign.imageUrl ? (
                  <img 
                    src={campaign.imageUrl} 
                    alt={campaign.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">No campaign image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-3 border border-white/30 shadow-sm">
                    {campaign.brand}
                  </span>
                  <h4 className="text-white font-bold text-2xl leading-tight drop-shadow-md">
                    {campaign.product}
                  </h4>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creators" className="outline-none">
            <CreatorRoster campaign={campaign} onManageCreators={() => router.push(`/dashboard/campaigns/wizard?id=${campaign.id}&step=3`)} />
          </TabsContent>

          <TabsContent value="briefs" className="outline-none">
            <Card className="shadow-sm border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Campaign Briefs</h3>
                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/campaigns/wizard?id=${campaign.id}&step=2`)}>
                  Edit Briefs
                </Button>
              </div>
              <div className="p-6 grid gap-6 md:grid-cols-2">
                {(campaign.briefs || []).map((brief, i) => (
                  <Dialog key={brief.id}>
                    <DialogTrigger asChild>
                      <Card className="p-5 border-slate-200 cursor-pointer hover:border-violet-300 transition-colors">
                        <h4 className="font-bold text-slate-900 mb-2">{brief.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-3 mb-4">{brief.keyMessages.join(", ")}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {brief.dos.slice(0, 2).map((d, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                              Do: {d}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{brief.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        <div>
                          <h4 className="font-bold text-slate-900 mb-2">Key Messages</h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                            {brief.keyMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                          </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 text-emerald-600">Dos</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                              {brief.dos.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 text-red-600">Don'ts</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                              {brief.donts.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="board" className="outline-none">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Deliverables Tracking</h3>
              <p className="text-sm text-slate-500">Track the status of all requested content.</p>
            </div>
            <DeliverablesBoard campaign={campaign} onUpdate={refreshCampaigns} />
          </TabsContent>

          <TabsContent value="files" className="outline-none">
            <Card className="p-12 shadow-sm border-slate-100 text-center">
              {mockFiles.length === 0 ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4">
                    <FolderOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No Files Uploaded</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto mb-6">
                    Upload contracts, brand guidelines, mood boards, or final assets here.
                  </p>
                </>
              ) : (
                <div className="mb-8 text-left max-w-2xl mx-auto">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Uploaded Files</h3>
                  <div className="space-y-3">
                    {mockFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{f.name}</p>
                            <p className="text-xs text-slate-500">{f.size} • Uploaded {f.date}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-700">Download</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <Button onClick={() => fileInputRef.current?.click()}>Upload File</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
