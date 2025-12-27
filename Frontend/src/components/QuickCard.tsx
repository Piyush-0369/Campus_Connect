import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function QuickCard({ icon, title, href }: { icon: ReactNode; title: string; href: string }) {
  return (
    <motion.a href={href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="card p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[--color-blue-50] text-[--color-blue] grid place-items-center">
          {icon}
        </div>
        <p className="font-semibold">{title}</p>
      </div>
    </motion.a>
  );
}
