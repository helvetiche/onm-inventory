import type { JSX } from "react";
import { Suspense } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { TabContent } from "@/app/components/TabContent";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Home({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const tab = params.tab ?? "dashboard";

  return (
    <div className="flex min-h-screen bg-white">
      <Suspense fallback={<aside className="w-80 shrink-0" aria-hidden />}>
        <Sidebar />
      </Suspense>
      <main
        className="flex-1 bg-white pl-80"
        role="main"
      >
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <TabContent tab={tab} />
        </Suspense>
      </main>
    </div>
  );
}
