import type { ReactNode } from "react";

const FOUNDATION_BACKGROUND_URL =
  "https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/Path%20to%20the%20Enchanted%20Academy.png?auto=format&fit=crop&w=1400&q=75";

export default function FoundationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative isolate h-full bg-[#0B1020]">
      {/* Shared decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${FOUNDATION_BACKGROUND_URL}")`,
          }}
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/55 via-[#0B1020]/75 to-[#0B1020]/95" />
      </div>

      {/* Existing page content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}