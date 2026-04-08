import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme.js";
import api from "../../api/client.js";

function HangingItem({ card, delay, onClick }) {
    const [hovered, setHovered] = useState(false);
    const { isDark } = useTheme();

    return (
        <motion.div
            style={{ transformOrigin: "top center" }}
            animate={hovered ? { rotate: 0 } : { rotate: [-2.2, 2.2, -2.2] }}
            transition={{
                duration: 4.5 + delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
            className="flex flex-col items-center"
        >
            <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-600 -mb-[2px]" />
                <div className="w-[1px] h-20 bg-gradient-to-b from-neutral-300 via-neutral-500 to-neutral-700 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-800" />
            </div>

            <motion.div
                onClick={() => onClick(card)}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                whileHover={{ scale: 1.03 }}
                initial={{ rotate: delay % 2 === 0 ? -2 : 2 }}
                className={`
          w-[150px]
          bg-white dark:bg-neutral-900
          cursor-pointer
        `}
                style={{
                    borderRadius: "4px",
                }}
            >
                <div className={`h-[1px] ${isDark ? "bg-neutral-700" : "bg-neutral-200"}`} />

                <div className="px-4 py-4">
                    <p className="text-[10px] tracking-widest text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                        {card.type || "announcement"}
                    </p>

                    <p className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-neutral-900"}`}>
                        {card.title || card.name}
                    </p>

                    <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                        {card.short || card.subtitle || card.category}
                    </p>
                </div>

                <div className="px-4 pb-4">
                    <p className={`text-[10px] ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
                        Tap to read →
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}

function Modal({ card, onClose }) {
    const { isDark } = useTheme();
    const isOffer = card.type === "offer" || card.category === "offer";

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${isDark ? "bg-neutral-900" : "bg-white"}`}
                    initial={{ scale: 0.9, y: 40, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.92, y: 30, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                >
                    <div className={`h-2 w-full ${isOffer ? "bg-amber-600" : "bg-neutral-800"}`} />

                    <div className="p-7">
                        <span
                            className={`inline-block text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full mb-5 ${isOffer
                                ? isDark
                                    ? "bg-amber-900 text-amber-300"
                                    : "bg-amber-100 text-amber-800"
                                : isDark
                                    ? "bg-neutral-800 text-neutral-500"
                                    : "bg-neutral-100 text-neutral-500"
                                }`}
                        >
                            {card.type || card.category || "announcement"}
                        </span>

                        <h2 className={`text-2xl font-semibold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
                            {card.title || card.name}
                        </h2>
                        <p className={`mb-6 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                            {card.short || card.subtitle}
                        </p>
                        <p className={`text-[15px] leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                            {card.description || card.text}
                        </p>
                    </div>

                    <div className={`border-t p-6 ${isDark ? "border-neutral-800" : "border-neutral-100"}`}>
                        <button
                            onClick={onClose}
                            className={`w-full py-3.5 rounded-2xl font-medium transition-colors ${isDark
                                ? "bg-white text-neutral-900 hover:bg-zinc-100"
                                : "bg-neutral-900 text-white hover:bg-black"
                                }`}
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export function HangingAnnouncements() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const { isDark } = useTheme();

    useEffect(() => {
        let mounted = true;

        setLoading(true);
        api
            .get("/announcements")
            .then(({ data }) => {
                if (mounted) {
                    const announcements = Array.isArray(data) ? data : [];
                    setCards(
                        announcements.map((item, idx) => ({
                            id: item._id || item.id || String(idx),
                            title: item.title || item.name || "",
                            short: item.subtitle || item.category || "",
                            description: item.description || item.text || "",
                            type: item.type || item.category || "announcement",
                        }))
                    );
                }
            })
            .catch(() => {
                if (mounted) setCards([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (loading || !cards.length) {
        return null;
    }

    return (
        <section className={`w-full py-16 ${isDark ? "bg-neutral-950" : "bg-neutral-50"} transition-colors`}>
            <div className="max-w-7xl mx-auto px-4 space-y-12">
                <p className={`text-xs font-semibold tracking-[0.3em] uppercase ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Announcements
                </p>

                <div className="relative w-full h-[52px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-800 via-amber-950 to-amber-900" />

                    <div
                        className="absolute inset-0 opacity-50 mix-blend-overlay"
                        style={{
                            backgroundImage: `
                repeating-linear-gradient(85deg, transparent, transparent 12px, rgba(255,255,255,0.12) 12px, rgba(255,255,255,0.12) 13px),
                repeating-linear-gradient(12deg, transparent, transparent 28px, rgba(0,0,0,0.35) 28px, rgba(0,0,0,0.35) 30px)
              `,
                        }}
                    />

                    <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/25 to-transparent" />

                    <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-950" />
                    <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-950" />
                </div>

                <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
                    {cards.map((card, index) => (
                        <HangingItem key={card.id} card={card} delay={index * 0.3} onClick={setSelected} />
                    ))}
                </div>
            </div>

            {selected && <Modal card={selected} onClose={() => setSelected(null)} />}
        </section>
    );
}
