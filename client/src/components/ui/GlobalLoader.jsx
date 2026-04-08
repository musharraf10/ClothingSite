import { AnimatePresence, motion } from "framer-motion";

export function GlobalLoader({ show }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black"
          aria-live="polite"
          aria-label="Loading MADVIRA"
        >
          <motion.p
            initial={{ opacity: 0, y: 8, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.34em" }}
            transition={{ duration: 0.55 }}
            className="font-heading text-lg md:text-xl font-medium tracking-[0.34em] text-white"
          >
            MADVIRA
          </motion.p>
          <div className="mt-6 h-[2px] w-44 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ x: "-100%" }}
              animate={{ x: ["-100%", "110%"] }}
              transition={{ repeat: Infinity, duration: 1.25, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
