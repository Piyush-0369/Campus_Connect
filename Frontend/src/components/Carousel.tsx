"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Item = { id: string; title: string; subtitle?: string; image?: string };

export default function Carousel({ items }: { items: Item[] }) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex gap-4 animate-[scroll_20s_linear_infinite] hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, i) => (
          <motion.div
            key={`${item.id}-${i}`}
            whileHover={{ y: -4 }}
            className="min-w-[260px] card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-[--color-blue-50] overflow-hidden">
                {item.image && (
                  <Image src={item.image} alt={item.title} width={48} height={48} className="h-12 w-12 object-cover" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-[--color-muted]">{item.subtitle}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
