import Link from "next/link";

export interface ColorCardData {
  slug: string;
  name: string;
  hex: string;
  emotions: string[];
}

interface ColorCardProps {
  color: ColorCardData;
  index?: number;
}

export default function ColorCard({ color, index = 0 }: ColorCardProps) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <Link href={`/colors/${color.slug}`} className="block h-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full transform hover:-translate-y-2 hover:scale-[1.02]">
          <div className="h-48 w-full relative group" style={{ backgroundColor: color.hex }}>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-mono shadow-md">
              {color.hex}
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">{color.name}</h2>
            <div className="mb-4">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Emotional Associations
              </h3>
              <div className="flex flex-wrap gap-2">
                {color.emotions.slice(0, 3).map((emotion, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm font-medium transition-transform hover:scale-105 inline-flex"
                    style={{ backgroundColor: `${color.hex}22`, color: color.hex }}
                  >
                    {emotion}
                  </span>
                ))}
                {color.emotions.length > 3 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                    +{color.emotions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
