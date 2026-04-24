import { Campaign } from "@/models/campaign.types";
import { ReportVideoOverride } from "@/providers/reporting-overrides.provider";
import Papa from "papaparse";

export type CsvOverrideRow = {
  videoId: string;
  creatorName: string;
  platform: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
  watchTimeHours?: number;
};

export const generateCsvTemplate = (campaign: Campaign): string => {
  const rows: any[] = [];
  campaign.selectedCreators?.forEach((creator) => {
    creator.deliverables?.forEach((del) => {
      rows.push({
        videoId: del.id,
        creatorName: creator.creatorId,
        platform: del.platform,
        views: "",
        likes: "",
        comments: "",
        shares: "",
        saves: "",
        reach: "",
        impressions: "",
        watchTimeHours: "",
      });
    });
  });

  return Papa.unparse(rows);
};

export const parseCsvOverrides = (
  csvContent: string
): Promise<{ overrides: Record<string, Partial<ReportVideoOverride>>; errors: string[] }> => {
  return new Promise((resolve) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const overrides: Record<string, Partial<ReportVideoOverride>> = {};
        const errors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          if (!row.videoId) {
            errors.push(`Row ${index + 1}: Missing videoId`);
            return;
          }

          const parseNum = (val: any) => {
            if (!val || val.trim() === "") return undefined;
            const parsed = Number(val);
            return isNaN(parsed) ? undefined : parsed;
          };

          const override: Partial<ReportVideoOverride> = {};
          if (row.views !== undefined && row.views !== "") override.views = parseNum(row.views);
          if (row.likes !== undefined && row.likes !== "") override.likes = parseNum(row.likes);
          if (row.comments !== undefined && row.comments !== "") override.comments = parseNum(row.comments);
          if (row.shares !== undefined && row.shares !== "") override.shares = parseNum(row.shares);
          if (row.saves !== undefined && row.saves !== "") override.saves = parseNum(row.saves);
          if (row.reach !== undefined && row.reach !== "") override.reach = parseNum(row.reach);
          if (row.impressions !== undefined && row.impressions !== "") override.impressions = parseNum(row.impressions);
          if (row.watchTimeHours !== undefined && row.watchTimeHours !== "") override.watchTimeHours = parseNum(row.watchTimeHours);

          if (Object.keys(override).length > 0) {
            overrides[row.videoId] = override;
          }
        });

        resolve({ overrides, errors });
      },
      error: (error: any) => {
        resolve({ overrides: {}, errors: [error.message] });
      },
    });
  });
};
