import { useState } from "react";
import { motion } from "framer-motion";
import styles from "./ProductStack3D.module.css";

function mod(i, n) {
  return ((i % n) + n) % n;
}

export function ProductStack3D({ images = [], captions = [], onCenterClick }) {
  const [current, setCurrent] = useState(0);
  const [dragX, setDragX] = useState(0);
  const n = images.length;

  if (!n) return null;

  const roles = {
    left2: mod(current - 2, n),
    left1: mod(current - 1, n),
    center: current,
    right1: mod(current + 1, n),
    right2: mod(current + 2, n),
  };

  const ROLE_STYLE = {
    left2: { x: -240, scale: 0.72, opacity: 0.25, z: 1, rotateY: 22 },
    left1: { x: -130, scale: 0.88, opacity: 0.7, z: 2, rotateY: 12 },
    center: { x: 0, scale: 1, opacity: 1, z: 5, rotateY: 0 },
    right1: { x: 130, scale: 0.88, opacity: 0.7, z: 2, rotateY: -12 },
    right2: { x: 240, scale: 0.72, opacity: 0.25, z: 1, rotateY: -22 },
  };

  function getRole(index) {
    for (const key in roles) {
      if (roles[key] === index) return key;
    }
    return "hidden";
  }

  function handleDragEnd(offset, velocity) {
    const shouldMove = Math.abs(offset) > 80 || Math.abs(velocity) > 350;
    if (!shouldMove) {
      setDragX(0);
      return;
    }
    const nextIndex = offset < 0 ? mod(current + 1, n) : mod(current - 1, n);
    setCurrent(nextIndex);
    setDragX(0);
  }

  return (
    <div className={styles.stage}>
      {images.map((src, i) => {
        const role = getRole(i);
        if (role === "hidden") return null;
        const style = ROLE_STYLE[role];

        return (
          <motion.div
            key={i}
            className={`${styles.card} ${role}`}
            style={{ zIndex: style.z }}
            animate={{
              x: style.x,
              scale: style.scale,
              opacity: style.opacity,
              rotateY: style.rotateY,
            }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 25,
              mass: 1.4,
            }}
          >
            {role === "center" ? (
              <motion.div
                className={styles.dragLayer}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDrag={(_e, info) => {
                  setDragX(info.offset.x * 0.4);
                }}
                onDragEnd={(_e, info) => {
                  handleDragEnd(info.offset.x, info.velocity.x);
                }}
                onDoubleClick={() => onCenterClick?.(i)}
                animate={{ x: dragX }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 22,
                  mass: 1.1,
                }}
              >
                <img src={src} className={styles.img} alt={captions?.[i] || `slide-${i + 1}`} />
                {captions?.[i] && <div className={styles.caption}>{captions[i]}</div>}
              </motion.div>
            ) : (
              <img src={src} className={styles.img} alt={`slide-${i + 1}`} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

