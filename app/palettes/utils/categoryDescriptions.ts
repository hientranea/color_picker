export function getCategoryDescription(category: string): string {
  const descriptions: { [key: string]: string } = {
    "Seafoam Shadow":
      "Cool, calming, and slightly mysterious, suggesting ocean depths and quiet contemplation.",
    "Silver Sage":
      "Cool and calming, evoking a sense of tranquility, balance, and quiet sophistication.",
    "Slate Horizon":
      "Sophisticated and calm, like a cloudy sky, providing a grounding and timeless feel.",
    "Stone Whisper":
      "Neutral and grounding, it offers understated elegance and a sense of quiet sophistication.",
    "Dusty Cocoa":
      "Neutral and comforting, evoking warmth and a sense of familiar comfort.",
    "Rustic Coral":
      "Warm and inviting, like sun-kissed terracotta, suggesting comfort and timeless appeal.",
    "Antique Parchment":
      "Vintage-inspired and gentle, perfect for creating a sense of history and refinement.",
    "Cinnamon Bark":
      "Warm and spicy, evoking comfort, earthiness, and a sense of cozy indulgence.",
    Blushwood:
      "Subtle and romantic, evoking the delicate beauty of a blooming flower and muted elegance.",
    "Twilight Iris":
      "A tranquil, lavender-tinged grey, promoting serenity and a touch of whimsy.",
    "Verdant Mist":
      "A cool, airy green suggesting freshness and tranquility, reminiscent of a lush meadow.",
    "Deep Plum Velvet":
      "Luxurious and rich, it evokes feelings of royalty, mystery, and sophisticated elegance.",
    "Crimson Clay":
      "Earthy and passionate, a grounding hue conveying warmth and quiet intensity.",
    "Indigo Twilight":
      "Mysterious and calming, evoking a sense of deep contemplation and quiet strength.",
    "Gingerbread Spice":
      "Warm and comforting, evokes feelings of home, hearth, and cozy autumnal moments.",
    "Burnt Sienna Rose":
      "Earthy and passionate, it conveys warmth, intensity, and subtle vintage appeal.",
    "Golden Harvest":
      "Warm and inviting, evokes feelings of abundance and autumnal comfort with a touch of glamour.",
    "Jade Serenity":
      "Calm and refreshing, suggesting balance, harmony, and a connection to nature.",
    "Lime Blossom":
      "Fresh and cheerful, suggesting new growth and vibrant energy with a subtle sweetness.",
    "Desert Clay":
      "Warm and earthy, evokes sun-baked landscapes and a feeling of rustic comfort.",
    "Orchid Haze":
      "A soft, muted purple hinting at romance and nostalgia, ideal for calming designs.",
    "Misty Mauve":
      "Soft and subtle, evokes a sense of quiet sophistication and understated elegance.",
    "Lavender Dusk":
      "Dreamy and soft, evoking a sense of peace and ethereal beauty at the close of day.",
    "Earthen Taupe":
      "Neutral and comforting, it evokes natural textures and a feeling of grounded stability.",
    "Rosewood Whisper":
      "Warm and comforting, evokes feelings of nostalgia and quiet, understated beauty.",
  };

  return (
    descriptions[category] ||
    `Explore our curated collection of ${category.toLowerCase()} color palettes for your next design project.`
  );
}
