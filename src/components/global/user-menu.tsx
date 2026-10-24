
"use client";

import React, { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";

export function UserMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-700" />
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          userButtonBox: "!h-10 !w-10",
          userButtonTrigger:
            "!h-10 !w-10 !rounded-full !p-0 ring-2 ring-cyan-400/60 hover:ring-cyan-300",
          userButtonAvatarBox: "!h-10 !w-10 !rounded-full",
          userButtonAvatarImage:
            "!h-full !w-full !rounded-full object-cover",
        },
      }}
    />
  );
}
