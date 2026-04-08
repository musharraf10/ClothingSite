import { motion } from "framer-motion";

export function PremiumCard({ children, className = "", ...props }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={`rounded-2xl bg-card/90 shadow-[0_12px_34px_rgba(0,0,0,0.16)] ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

