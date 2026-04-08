import { motion } from "framer-motion";

export function PremiumButton({
  children,
  className = "",
  as = "button",
  ...props
}) {
  const Comp = motion[as] || motion.button;
  return (
    <Comp
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.6 }}
      className={`rounded-2xl transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
}

