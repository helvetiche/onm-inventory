import type { JSX } from "react";
import { DashboardShell } from "./_components/dashboard/DashboardShell";

const Home = (): JSX.Element => {
  return (
    <main className="min-h-screen bg-emerald-50/40">
      <DashboardShell />
    </main>
  );
};

export default Home;
