"use client";

import type { JSX, ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/app/components/Sidebar";

type SidebarLayoutProps = {
  children: ReactNode;
};

export function SidebarLayout({ children }: SidebarLayoutProps): JSX.Element {
  const [isIconOnly, setIsIconOnly] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        isIconOnly={isIconOnly}
        onToggleIconOnly={() => setIsIconOnly((prev) => !prev)}
      />
      <main
        className="flex-1 bg-white transition-[padding] duration-200 ease-in-out"
        style={{ paddingLeft: isIconOnly ? "6rem" : "20rem" }}
        role="main"
      >
        {children}
      </main>
    </div>
  );
}
