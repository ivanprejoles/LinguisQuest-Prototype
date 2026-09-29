"use client";

import React, { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";

export function UserMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center p-0.5 rounded-2xl ring-2 ring-emerald-500/20 hover:ring-emerald-500/50 transition min-h-[40px] min-w-[40px]">
      {mounted ? (
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 rounded-xl",
            },
          }}
        />
      ) : (
        <div className="h-9 w-9 rounded-xl bg-slate-200 animate-pulse" />
      )}
    </div>
  );
}