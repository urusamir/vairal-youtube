#!/bin/bash
FILE="/Users/munaaahmed/Vairal YouTube /src/app/(platform)/dashboard/campaigns/wizard/page.tsx"
# Find the line number where Step4 starts
START_LINE=$(grep -n "export function Step4" "$FILE" | cut -d: -f1)

if [ -z "$START_LINE" ]; then
    echo "Could not find Step4"
    exit 1
fi

# Keep everything before Step4
head -n $((START_LINE - 1)) "$FILE" > tmp_wizard.tsx

# Append the new Step4
cat << 'INNER_EOF' >> tmp_wizard.tsx
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
INNER_EOF

mv tmp_wizard.tsx "$FILE"
