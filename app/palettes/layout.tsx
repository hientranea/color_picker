import { metadata as palettesMetadata } from "./metadata";

export const metadata = palettesMetadata;

export default function PalettesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
