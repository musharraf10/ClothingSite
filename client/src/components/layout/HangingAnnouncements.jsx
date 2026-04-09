import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from "../../hooks/useTheme.js";
import api from "../../api/client.js";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx"

export function HangingAnnouncements() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [swingAngle, setSwingAngle] = useState(0);
    const lastScrollXRef = useRef(0);
    const springTimeoutRef = useRef(null);
    const isScrollingRef = useRef(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Fetch announcements from API
    useEffect(() => {
        let mounted = true;

        setLoading(true);
        api
            .get("/announcements")
            .then(({ data }) => {
                if (mounted) {
                    const announcements = Array.isArray(data) ? data : [];
                    setCards(
                        announcements.map((item, idx) => {
                            const title = item.title || item.name || item.subtitle || item.category || "";
                            const short = item.short || item.subtitle || item.category || (item.title ? item.text : "") || "";
                            const description = item.description || item.text || "";
                            const type = item.type || item.category || "announcement";

                            return {
                                id: item._id || item.id || String(idx),
                                title,
                                short,
                                description,
                                type,
                            };
                        })
                    );
                }
            })
            .catch(() => {
                if (mounted) setCards([]);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    // Scroll handling
    useEffect(() => {
        const wrapper = scrollRef.current;
        if (!wrapper) return;

        const handleScroll = () => {
            const currentScrollX = wrapper.scrollLeft;
            const delta = currentScrollX - lastScrollXRef.current;
            lastScrollXRef.current = currentScrollX;

            isScrollingRef.current = true;
            const angle = Math.max(-14, Math.min(14, delta * -0.5));
            setSwingAngle(angle);

            const cardWidth = 240;
            setActiveIndex(Math.round(currentScrollX / cardWidth));

            if (springTimeoutRef.current) clearTimeout(springTimeoutRef.current);
            springTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
                setSwingAngle(0);
            }, 60);
        };

        wrapper.addEventListener('scroll', handleScroll, { passive: true });
        return () => wrapper.removeEventListener('scroll', handleScroll);
    }, []);

    const openModal = useCallback((index) => {
        setSelectedItem(cards[index]);
        setIsModalOpen(true);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setModalVisible(true));
        });
    }, [cards]);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setTimeout(() => {
            setIsModalOpen(false);
            setSelectedItem(null);
        }, 300);
    }, []);

    const scrollToCard = (index) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: index * 240, behavior: 'smooth' });
        }
    };

    const handleMouseDown = (e) => {
        const wrapper = scrollRef.current;
        if (!wrapper) return;

        let startX = e.pageX - wrapper.offsetLeft;
        let scrollLeft = wrapper.scrollLeft;

        const onMouseMove = (moveEvent) => {
            const x = moveEvent.pageX - wrapper.offsetLeft;
            wrapper.scrollLeft = scrollLeft - (x - startX) * 1.2;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    if (loading || !cards.length) {
        return null;
    }

    const accentColor = isDark ? "#ffffff" : "#000000";

    return (
        <>
            <style>{`
        @property --border-angle {
          syntax: '<angle>';
          inherits: true;
          initial-value: 0turn;
        }
        @keyframes rotateBorder {
          to { --border-angle: 1turn; }
        }
        @keyframes naturalSwing {
          0%, 100% { transform: rotate(-2.2deg); }
          50% { transform: rotate(2.2deg); }
        }
        .card-border-wrapper {
          background: conic-gradient(
            from var(--border-angle),
            transparent 60%,
            ${isDark ? "#f5f5f5" : "#555"} 72%,
            ${accentColor} 80%,
            ${isDark ? "#f5f5f5" : "#555"} 88%,
            transparent 100%
          );
          animation: rotateBorder 3.5s linear infinite;
          padding: 1.5px;
          border-radius: 18px;
        }
        .card-border-wrapper-light {
          background: conic-gradient(
            from var(--border-angle),
            transparent 60%,
            ${isDark ? "#444" : "#999"} 72%,
            ${isDark ? "#666" : "#777"} 80%,
            ${isDark ? "#444" : "#999"} 88%,
            transparent 100%
          );
          animation: rotateBorder 3.5s linear infinite;
          padding: 1.5px;
          border-radius: 18px;
        }
        .card-inner {
          border-radius: 17px;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalOut {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.88) translateY(20px); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pin-float { animation: floatPin 2s ease-in-out infinite; }
        @keyframes floatPin {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(${isDark ? "255,255,255" : "0,0,0"}, 0.5); }
          50% { box-shadow: 0 0 0 4px rgba(${isDark ? "255,255,255" : "0,0,0"}, 0); }
        }
        .active-dot { animation: dotPulse 1.5s ease-in-out infinite; }
      `}</style>
            <div className="pt-6"> <SectionHeader title=" Announcements" subtitle="WHAT'S NEW" /></div>


            <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-[rgb(10 10 10)]'} font-sans flex flex-col items-center overflow-hidden select-none pt-6 pb-12`}>

                {/* Scroll Hint */}
                <div className={`flex items-center gap-2 ${isDark ? 'text-[#555]' : 'text-[#666]'} text-xs tracking-[2px] uppercase mb-2`}>
                    <span>Scroll to explore</span>
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                        <path d="M1 7h14M11 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Rope SVG */}
                <div className="w-full">
                    <svg className="w-full h-8" viewBox="0 0 1200 32" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 16 Q150 22 300 14 Q450 24 600 15 Q750 23 900 13 Q1050 22 1200 16"
                            stroke={isDark ? "#2e2e2e" : "#c8c8c8"}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d="M0 16 Q150 22 300 14 Q450 24 600 15 Q750 23 900 13 Q1050 22 1200 16"
                            stroke={isDark ? "#1a1a1a" : "#e0e0e0"}
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Scrollable Cards */}
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    className="w-full overflow-x-auto overflow-y-visible scrollbar-hide cursor-grab active:cursor-grabbing pb-1"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    <div className="flex gap-0 px-10 w-max" style={{ paddingBottom: '32px' }}>
                        {cards.map((item, i) => {
                            const isDarkCard = i % 2 === 0;
                            const staggeredAngle = swingAngle * (1 + i * 0.08);
                            const isScrolling = isScrollingRef.current;

                            const typeLabel = item.type === 'offer' ? 'OFFER' :
                                item.type === 'coupon' ? 'COUPON' :
                                    item.type === 'announcement' ? 'NEW' : 'UPDATE';

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col items-center w-[240px] flex-shrink-0"
                                    style={{
                                        transform: `rotate(${Math.abs(staggeredAngle) > 0.5 ? staggeredAngle : 0}deg)`,
                                        transformOrigin: 'top center',
                                        animation: Math.abs(staggeredAngle) < 0.5 ? `naturalSwing ${4.5 + i * 0.3}s ease-in-out infinite` : 'none',
                                        transition: isScrolling
                                            ? `transform ${80 + i * 15}ms ease-out`
                                            : `transform ${700 + i * 60}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                                        zIndex: Math.abs(staggeredAngle) > 2 ? 10 - i : 'auto',
                                    }}
                                >
                                    {/* Clothespin */}
                                    <div className="w-[22px] h-[28px] relative z-10 -mb-[2px] pin-float" style={{ animationDelay: `${i * 0.4}s` }}>
                                        <div className={`w-full h-full rounded-t border relative ${isDark
                                            ? 'bg-[#2a2a2a] border-[#3a3a3a]'
                                            : 'bg-[#e8e8e8] border-[#b8b8b8]'}`}>
                                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] h-[10px] rounded-b ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f0f0f0]'}`} />
                                        </div>
                                    </div>

                                    {/* Card */}
                                    <div
                                        onClick={() => openModal(i)}
                                        className="cursor-pointer transition-transform duration-300 hover:scale-[1.04] origin-top w-[180px]"

                                    >
                                        <div className={isDarkCard ? 'card-border-wrapper' : 'card-border-wrapper-light'}>
                                            <div className={`card-inner ${isDarkCard
                                                ? 'bg-gradient-to-br from-[#1c1c1c] to-[#0f0f0f]'
                                                : 'bg-white shadow-sm border border-[#e5e5e5]'}`}>

                                                {/* Neckline */}
                                                <div className="h-8 relative overflow-hidden">
                                                    <div className="flex justify-between absolute inset-x-0 top-0 h-8">
                                                        <div className="w-8 h-7 rounded-br-full" style={{ background: isDarkCard ? '#0a0a0a' : '#f0f0f0' }} />
                                                        <div className="w-8 h-7 rounded-bl-full" style={{ background: isDarkCard ? '#0a0a0a' : '#f0f0f0' }} />
                                                    </div>
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-7 rounded-full"
                                                        style={{ background: isDarkCard ? '#0a0a0a' : '#f0f0f0' }} />
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-5 pb-6">
                                                    <div className={`inline-block text-[10px] font-semibold tracking-[2px] uppercase px-3 py-1 rounded-full mb-3 
                                                        ${isDarkCard
                                                            ? 'bg-white/10 text-[#fff]'
                                                            : 'bg-black/5 text-black border border-black/10'}`}>
                                                        {typeLabel}
                                                    </div>

                                                    <div className={`font-bold text-[27px] leading-none tracking-wide mb-2 ${isDarkCard ? 'text-[#fff]' : 'text-[rgb(220 208 208)]'}`}
                                                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                                        {item.title}
                                                    </div>

                                                    <div className={`text-sm leading-relaxed mb-5 ${isDarkCard ? 'text-[#bbb]' : 'text-[rgb(220 208 208)]'}`}>
                                                        {item.short}
                                                    </div>

                                                    <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                                                        <span className={isDarkCard ? 'text-[#fff]' : 'text-black font-medium'}>Details</span>
                                                        <div className={`w-2 h-2 rounded-full ${isDarkCard ? 'bg-white' : 'bg-black'} animate-pulse`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Modal - Improved for Light Mode */}
            {isModalOpen && selectedItem && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center p-5`}
                    style={{
                        background: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(24px)'
                    }}
                    onClick={closeModal}
                >
                    <div
                        className={`relative ${isDark ? 'bg-[#111]' : 'bg-white'} w-full max-w-[380px] overflow-hidden rounded-3xl shadow-xl ${modalVisible ? 'modal-card-enter' : 'modal-card-exit'}`}
                        style={{ border: `1px solid ${isDark ? '#222' : '#ddd'}` }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Rotating Border */}
                        <div
                            className="absolute inset-0 rounded-3xl pointer-events-none"
                            style={{
                                background: `conic-gradient(from var(--border-angle), transparent 60%, ${isDark ? "#ddd" : "#666"} 75%, ${accentColor} 82%, ${isDark ? "#ddd" : "#666"} 90%, transparent 100%)`,
                                animation: 'rotateBorder 2.5s linear infinite',
                                padding: '1px',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                            }}
                        />

                        <button
                            onClick={closeModal}
                            className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-lg z-10 transition-all
                                ${isDark ? 'bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white' : 'bg-[#f5f5f5] hover:bg-[#e5e5e5] text-black'}`}
                        >
                            ✕
                        </button>

                        <div className="p-8 pb-6 text-center">
                            <div className={`inline-block text-xs font-semibold tracking-[2px] uppercase px-4 py-1 rounded-full mb-4 
                                ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}>
                                {selectedItem.type === 'offer' ? 'Offer' : 'Announcement'}
                            </div>

                            <h2 className={`text-4xl font-bold tracking-wide mb-3 ${isDark ? 'text-white' : 'text-black'}`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                {selectedItem.title}
                            </h2>

                            <p className={`${isDark ? 'text-[#666]' : 'text-[#555]'} text-base mb-6`}>{selectedItem.short}</p>

                            <div className={`w-12 h-px mx-auto mb-6 ${isDark ? 'bg-[#333]' : 'bg-[#ddd]'}`} />

                            <p className={`${isDark ? 'text-[#aaa]' : 'text-[#444]'} text-[15px] leading-relaxed`}>
                                {selectedItem.description}
                            </p>
                        </div>

                        <div className={`border-t p-5 ${isDark ? 'border-[#222]' : 'border-[#eee]'}`}>
                            <button
                                onClick={closeModal}
                                className={`w-full py-4 rounded-2xl font-semibold transition-all
                                    ${isDark
                                        ? 'bg-white text-black hover:bg-[#f0f0f0]'
                                        : 'bg-black text-white hover:bg-[#222]'}`}
                            >
                                Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}