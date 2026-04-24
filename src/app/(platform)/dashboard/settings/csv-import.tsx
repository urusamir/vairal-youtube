"use client";

import React, { useState, useRef } from "react";
import { Campaign } from "@/models/campaign.types";
import { useReportingOverrides, ReportVideoOverride } from "@/providers/reporting-overrides.provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCsvTemplate, parseCsvOverrides } from "@/lib/reporting-csv";

export default function CSVImport({ campaign }: { campaign: Campaign }) {
  const { overrides, setManyOverrides, saveOverridesToDatabase } = useReportingOverrides();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [parsedOverrides, setParsedOverrides] = useState<Record<string, Partial<ReportVideoOverride>>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate(campaign);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `template_${campaign.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const { overrides, errors } = await parseCsvOverrides(content);
      
      setParsedOverrides(overrides);
      setErrors(errors);
      setStep(3);
    };
    reader.readAsText(file);
  };

  const handleApply = async () => {
    setIsSaving(true);
    // Push directly to database
    const success = await saveOverridesToDatabase(campaign.id, parsedOverrides);
    setIsSaving(false);
    
    if (success) {
      setManyOverrides(parsedOverrides); // Update local state
      toast({
        title: "Overrides Applied",
        description: `Successfully applied data for ${Object.keys(parsedOverrides).length} deliverables to the database.`,
      });
      setStep(1);
      setParsedOverrides({});
    } else {
      toast({
        title: "Error",
        description: "Failed to apply overrides to Supabase database.",
        variant: "destructive",
      });
    }
  };

  const overrideKeys = Object.keys(parsedOverrides);

  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl overflow-hidden p-8">
      
      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center bg-white px-4 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${step >= s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            <span className={`text-xs font-medium ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
              {s === 1 ? 'Download' : s === 2 ? 'Upload' : 'Preview'}
            </span>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        {step === 1 && (
          <div className="text-center space-y-6 py-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Download CSV Template</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Start by downloading the template specifically generated for this campaign. It contains all the exact Video IDs needed to sync your manual data.
              </p>
            </div>
            <Button onClick={handleDownloadTemplate} className="bg-slate-900 hover:bg-slate-800 text-white px-8">
              Download Template
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6 py-12">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Completed CSV</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Fill out the template with your real metrics and upload it back here. We will parse the changes and show you a preview before applying.
              </p>
            </div>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="text-slate-600">Back</Button>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 hover:bg-slate-800 text-white px-8">
                Select CSV File
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Preview Changes</h3>
              <p className="text-slate-500">
                Found updates for <strong className="text-slate-900">{overrideKeys.length}</strong> deliverables.
              </p>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-2 font-bold">
                  <AlertCircle className="w-5 h-5" /> Parsing Errors
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {overrideKeys.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Video ID</TableHead>
                      <TableHead>Updated Fields</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overrideKeys.map(vid => {
                      const o = parsedOverrides[vid];
                      return (
                        <TableRow key={vid}>
                          <TableCell className="font-mono text-xs text-slate-600">{vid}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(o).map(([k, v]) => (
                                <span key={k} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {k}: {typeof v === 'object' ? JSON.stringify(v) : v}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                No valid overrides found in the CSV.
              </div>
            )}

            <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep(2)} className="text-slate-600">Upload Different File</Button>
              <Button 
                onClick={handleApply} 
                disabled={overrideKeys.length === 0 || isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Apply Overrides
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
