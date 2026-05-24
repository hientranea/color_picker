// Type alias maintained for components that import ColorData from this path.
// The runtime data layer lives in colorDataService.ts (sourced from the snapshot).
import type { ColorPsychologyData } from "@/types/supabase";

export type ColorData = ColorPsychologyData;

export interface ColorInfo {
  slug: string;
  data: ColorData;
}
