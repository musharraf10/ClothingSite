import { Link } from "react-router-dom";

const footerLinkGroups = [
  [
    { label: "About", to: "/about" },
    { label: "Support", to: "/support" },
    { label: "Orders", to: "/account/orders" },
  ],
  [
    { label: "Terms", to: "/terms" },
    { label: "Privacy", to: "/privacy" },
  ],
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto w-full px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] items-start">

          {/* Policies — left */}
          <div>
            <h2 className="text-base font-semibold tracking-[0.2em] uppercase text-fg mb-4">
              Policies
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              {footerLinkGroups[0].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Centre — SVG handles everything: ring + rotating text + M logo */}
          <div className="flex justify-center">
            <svg
              viewBox="0 0 220 220"
              className="w-52 h-52"
              aria-hidden="true"
            >
              <defs>
                {/*
                  Outer ring visible border: r=96 → drawn as circle
                  Inner logo circle: r=72
                  Text path: r=84 → sits in the gap between r=72 and r=96
                  All centred at 110,110
                */}
                <path
                  id="text-ring"
                  d="M110,26 a84,84 0 1,1 -0.01,0 Z"
                />
              </defs>

              {/* Outer border ring */}
              <circle
                cx="110" cy="110" r="96"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />

              {/* Inner filled circle (logo bg) */}
              <circle
                cx="110" cy="110" r="72"
                fill="#111111"
              />

              {/* M lettermark */}
              <text
                x="110" y="116"
                textAnchor="middle"
                fontSize="26"
                fontWeight="600"
                fontFamily="inherit"
                fill="white"
                letterSpacing="2"
              >
                M
              </text>

              {/* Rotating text — spins around centre, path r=84 sits inside the ring */}
              <g style={{ transformOrigin: "110px 110px", animation: "footer-spin 14s linear infinite" }}>
                <text
                  fontSize="7.5"
                  letterSpacing="3.5"
                  fontFamily="inherit"
                  fontWeight="500"
                  fill="currentColor"
                  className="text-muted"
                >
                  <textPath href="#text-ring" startOffset="0%">
                    BE MAD  •  BE BOLD  •  BE YOU  •
                  </textPath>
                </text>
              </g>

              <style>{`
                @keyframes footer-spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
              `}</style>
            </svg>
          </div>

          {/* Quick Links — right aligned */}
          <div className="lg:text-right">
            <h2 className="text-base font-semibold tracking-[0.2em] uppercase text-fg mb-4">
              Quick Links
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              {footerLinkGroups[1].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-fg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#262626] pt-6 text-center text-xs text-muted sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} MADVIRA. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">Facebook</a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-fg">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}