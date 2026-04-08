import { motion } from "framer-motion";

export function PageTransition({ children, transitionKey }) {
  return (
    <motion.div
      key={transitionKey}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

