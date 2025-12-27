import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function AnnouncementCard({ title, description, cta }: { title: string; description: string; cta?: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-5 bg-[--color-blue-50] border-[--color-blue-50]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[--color-blue]">{title}</h3>
          <p className="text-sm text-[--color-muted] mt-1">{description}</p>
        </div>
        {cta}
      </div>
    </motion.div>
  );
}
