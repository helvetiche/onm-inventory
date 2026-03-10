"use client";

import type { JSX, ReactNode } from "react";
import { Suspense, useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";

type SidebarLayoutProps = {
  children: ReactNode;
};

export function SidebarLayout({ children }: SidebarLayoutProps): JSX.Element {
  const [isIconOnly, setIsIconOnly] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Suspense fallback={<aside className="w-80 shrink-0" aria-hidden />}>
        <Sidebar
        isIconOnly={isIconOnly}
        onToggleIconOnly={() => setIsIconOnly((prev) => !prev)}
        />
      </Suspense>
      <main
        className="flex-1 bg-white pl-80"
        role="main"
      >
        {children}
      </main>
    </div>
  );
}
