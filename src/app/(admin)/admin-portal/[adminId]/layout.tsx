import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Languages, Sparkles, Users, Podium } from "lucide-react";
import "@/app/globals.css";
import { UserMenu } from "@/components/global/user-menu";

// Dynamic Navigation Config - Add or modify links easily here
interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export default async function AdminPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;
  const user = await currentUser();

  // Guard check: ensure user exists and has admin role
  if (!user) {
    redirect("/sign-in");
  }

  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/404");
  }

  // Dynamic Center Navigation Items
  const navItems: NavItem[] = [
    {
      label: "Languages",
      href: `/admin-portal/${adminId}`,
      icon: Languages,
    },
    {
      label: "Leaderboards",
      href: `/admin-portal/${adminId}/leaderboards`,
      icon: Podium,
    },
    {
      label: "Accounts",
      href: `/admin-portal/${adminId}/accounts`,
      icon: Users,
      // badge: "Beta",
    },
  ];

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-white font-sans">
      {/* Header Bar */}
      <header className="relative z-50 w-full shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* ================= LEFT: Rectangular Logo Container ================= */}
          <div className="flex items-center shrink-0">
            <Link
              href={`/admin-portal/${adminId}`}
              className="flex items-center gap-3 group transition-opacity hover:opacity-90"
            >
              {/* Responsive Container handling rectangular or square logos */}
              
              <div
                className="
                  group relative isolate flex h-14 max-w-[180px] sm:max-w-[220px]
                  items-center justify-start overflow-hidden rounded-xl p-1.5
                  border border-white/80
                  bg-gradient-to-br from-white via-slate-100 to-slate-300
                  shadow-[0_5px_0_#94a3b8,0_7px_12px_rgba(15,23,42,0.2),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(100,116,139,0.25)]
                  transition-all duration-200 ease-out
                  hover:translate-y-[2px]
                  hover:shadow-[0_3px_0_#94a3b8,0_5px_9px_rgba(15,23,42,0.18),inset_0_2px_3px_rgba(255,255,255,0.95)]
                "
              >
                {/* Top glossy highlight */}
                <div
                  className="pointer-events-none absolute inset-0 z-20 rounded-xl
                    bg-gradient-to-b from-white/60 via-white/10 to-transparent"
                />

                {/* Animated side shine */}
                <div
                  className="pointer-events-none absolute -inset-y-1/3 right-0 z-30
                    w-1/3 translate-x-[150%] -skew-x-12
                    bg-gradient-to-r from-transparent via-white/90 to-transparent
                    transition-transform duration-700 ease-in-out
                    group-hover:-translate-x-[350%]"
                />

                <img
                  src="/LinguisQuest-title.png"
                  alt="LinguisQuest"
                  className="relative z-10 h-full w-auto object-contain"
                />
              </div>

            </Link>
          </div>

          {/* ================= CENTER: Dynamic Navigation Bar ================= */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
                >
                  {Icon && <Icon className="w-4 h-4 text-cyan-600" />}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-black tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ================= RIGHT: User Profile & Dropdown ================= */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-800 leading-tight">
                {user.firstName || "Admin"}
              </span>
              <span className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase">
                Administrator
              </span>
            </div>

            {/* Clerk UserButton provides native click dropdown */}
            {/* <div className="flex items-center p-0.5 rounded-2xl ring-2 ring-emerald-500/20 hover:ring-emerald-500/50 transition">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 rounded-xl",
                  },
                }}
              />
            </div> */}
            <UserMenu />
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex w-full flex-1 min-h-0 min-w-0 flex-col overflow-hidden">{children}</main>
    </div>
  );
}