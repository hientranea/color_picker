// app/palettes/page.tsx
"use client";
import { useState, useCallback } from "react";
import PalettesList from "./components/PalettesList";
import { useColorSchemes } from "./hooks/useColorSchemes";
import Header from "@/components/header";

export default function PalettesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);
  const {
    data: colorSchemes,
    isLoading,
    error,
  } = useColorSchemes(selectedCategoryId);

  const handleCategoryChange = useCallback((categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId);
  }, []);

  if (isLoading) return <div className="p-8">Loading palettes...</div>;
  if (error)
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  if (!colorSchemes) return <div className="p-8">No palettes found.</div>;

  return (
    <div className="p-8">
      <Header />
      <PalettesList
        colorSchemes={colorSchemes}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  );
}
