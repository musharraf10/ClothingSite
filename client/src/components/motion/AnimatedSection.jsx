import { motion } from "framer-motion";

const variants = {
  up: { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 24 }, whileInView: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -24 }, whileInView: { opacity: 1, x: 0 } },
};

export function AnimatedSection({ children, direction = "up", className = "" }) {
  const preset = variants[direction] || variants.up;
  return (
    <motion.section
      initial={preset.initial}
      whileInView={preset.whileInView}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

