import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./HeroicSection.module.css";

export function HeroicSection({ products = [] }) {
  if (!products.length) return null;
  const [center, left, right] = products;

  return (
    <section className={`${styles.section} relative`}>
      <div className="hidden md:block absolute left-0 right-0 -top-8 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-muted">Madvira Luxury Minimal</p>
      </div>

      {[left, center, right].filter(Boolean).map((item, idx) => {
        const isCenter = idx === 1 || (!left && idx === 0);
        return (
          <motion.article
            key={item._id || item.slug}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: idx * 0.08 }}
            className={`${styles.panel} madvira-motion madvira-hover ${isCenter ? "md:scale-[1.06] md:z-10" : "md:opacity-85"}`}
          >
            <Link to={`/product/${item.slug}`}>
              <img src={item.images?.[0]} alt={item.name} className={styles.media} loading="lazy" />
              <div className={styles.content}>
                <p className={styles.eyebrow}>{isCenter ? "Featured Drop" : "Collection"}</p>
                <h2 className={styles.title}>{item.name}</h2>
                {isCenter && <p className={styles.subtitle}>{item.description}</p>}
              </div>
            </Link>
          </motion.article>
        );
      })}
    </section>
  );
}

