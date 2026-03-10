import type { JSX } from "react";
import { Suspense } from "react";
import { SidebarLayout } from "@/app/components/SidebarLayout";
import { TabContent } from "@/app/components/TabContent";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function Home({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const tab = params.tab ?? "dashboard";

  return (
    <SidebarLayout>
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <TabContent tab={tab} />
      </Suspense>
    </SidebarLayout>
  );
}
