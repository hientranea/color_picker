export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ColorPsychologyData {
  id: string;
  color_name: string;
  hex_code: string;
  wheel_position: string;
  psychological_meaning: string;
  emotional_associations: string[];
  complementary_colors: string[];
  suggested_palettes: {
    name: string;
    swatches: string[];
  }[];
  industry_use_cases: {
    [key: string]: string[];
  };
  real_world_examples: {
    title: string;
    description: string;
    image_url: string;
  }[];
  how_to_pair: string[];
  call_to_action: string;
  seo_meta: {
    title: string;
    description: string;
  };
  created_at: string;
  updated_at: string;
}
