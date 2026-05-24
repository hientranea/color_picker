import { Metadata } from "next";
import { getColorBySlug } from "../utils/colorDataService";

interface MetadataProps {
  params: {
    color_name: string;
  };
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const colorSlug = params.color_name;
  const colorInfo = await getColorBySlug(colorSlug);

  if (!colorInfo) {
    return {
      title: "Color Not Found",
      description: "The requested color information could not be found.",
    };
  }

  const { data } = colorInfo;

  // Generate keywords based on color data
  const keywords = [
    data.color_name,
    "color meaning",
    "color psychology",
    "color palette",
    "color hex code",
    "design",
    "web design",
    "color theory",
    ...data.emotional_associations,
  ];

  return {
    title: data.seo_meta.title,
    description: data.seo_meta.description,
    keywords: keywords.join(", "),
    openGraph: {
      title: data.seo_meta.title,
      description: data.seo_meta.description,
      images: [
        {
          url: `/api/og?color=${encodeURIComponent(
            data.hex_code
          )}&name=${encodeURIComponent(data.color_name)}`,
          width: 1200,
          height: 630,
          alt: `${data.color_name} color swatch`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.seo_meta.title,
      description: data.seo_meta.description,
      images: [
        `/api/og?color=${encodeURIComponent(
          data.hex_code
        )}&name=${encodeURIComponent(data.color_name)}`,
      ],
    },
  };
}