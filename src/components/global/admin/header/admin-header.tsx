
import Link from "next/link";
import {
  Languages,
  Podium,
  Users,
} from "lucide-react";

import { UserMenu } from "@/components/global/user-menu";
import Image from "next/image";

interface AdminHeaderProps {
  adminId: string;
  firstName?: string | null;
}

const navItems = [
  {
    label: "Languages",
    href: (id: string) => `/admin-portal/${id}`,
    icon: Languages,
  },
  {
    label: "Leaderboards",
    href: (id: string) => `/admin-portal/${id}/leaderboards`,
    icon: Podium,
  },
  {
    label: "Accounts",
    href: (id: string) => `/admin-portal/${id}/accounts`,
    icon: Users,
  },
];

export function AdminHeader({
  adminId,
  firstName,
}: AdminHeaderProps) {
  return (
    <header className="relative z-50 w-full shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        <Link
            href={`/admin-portal/${adminId}`}
            aria-label="LinguisQuest Admin Home"
            className="flex shrink-0 items-center"
        >
            <Image
                src="https://ik.imagekit.io/uch28of0b/LinguisQuest-public-assets/LinguisQuest-title.png"
                alt="LinguisQuest"
                width={220}
                height={60}
                priority
                className="h-10 w-auto object-contain"
            />
        </Link>

        <nav className="
          hidden items-center gap-1 rounded-2xl
          border border-slate-200/60 bg-slate-100/80 p-1.5 md:flex
        ">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href(adminId)}
                className="
                  flex items-center gap-2 rounded-xl px-3.5 py-1.5
                  text-xs font-black text-slate-600 transition-all
                  hover:bg-white hover:text-slate-900 hover:shadow-sm
                  sm:text-sm
                "
              >
                <Icon className="size-4 text-cyan-600" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-xs font-black leading-tight text-slate-800">
              {firstName || "Admin"}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
              Administrator
            </span>
          </div>

          <UserMenu />
        </div>

      </div>
    </header>
  );
}
