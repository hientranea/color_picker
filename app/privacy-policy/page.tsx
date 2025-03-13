import { Metadata } from "next";
import PrivacyPolicy from "@/components/privacy/policy-container";

export const metadata: Metadata = {
  title: "Privacy Policy | ColorOne - Canvas Creative",
  description:
    "Privacy Policy for ColorOne - Canvas Creative, detailing how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
