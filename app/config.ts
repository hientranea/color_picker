// Configuration for the application
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://colorone.site";

export const siteConfig = {
  name: "ColorOne",
  url: APP_URL,
  metadataBase: new URL(APP_URL),
  description:
    "Professional color picking and palette management for creative professionals.",
};
