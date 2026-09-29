import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Languages, Sparkles } from "lucide-react";
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
      label: "Analytics",
      href: `/admin-portal/${adminId}/analytics`,
      icon: LayoutDashboard,
    },
    {
      label: "AI Studio",
      href: `/admin-portal/${adminId}/ai-studio`,
      icon: Sparkles,
      badge: "Beta",
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-Faiw-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* ================= LEFT: Rectangular Logo Container ================= */}
          <div className="flex items-center shrink-0">
            <Link
              href={`/admin-portal/${adminId}`}
              className="flex items-center gap-3 group transition-opacity hover:opacity-90"
            >
              {/* Responsive Container handling rectangular or square logos */}
              <div className="h-10 max-w-[180px] sm:max-w-[220px] flex items-center justify-start overflow-hidden rounded-xl bg-slate-100 p-1.5 border border-slate-200/60 shadow-inner">
                <img
                  src="/logo.png" // Replace with your actual logo path
                  alt="Application Logo"
                  className="h-full w-auto object-contain"
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
                  {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
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
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
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
      <main className="w-full flex-1 flex flex-col">{children}</main>
    </div>
  );
}