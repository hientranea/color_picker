// app/palettes/page.tsx
"use client";

import PalettesList from "./components/PalettesList";
import { useColorSchemes } from "./hooks/useColorSchemes";

export default function PalettesPage() {
  const { data: colorSchemes, isLoading, error } = useColorSchemes();

  if (isLoading) return <div className="p-8">Loading palettes...</div>;
  if (error)
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  if (!colorSchemes) return <div className="p-8">No palettes found.</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Color Palettes</h1>
      <PalettesList colorSchemes={colorSchemes} />
    </div>
  );
}
