import type { JSX } from "react";
import { DashboardShell } from "./_components/dashboard/DashboardShell";

const Home = (): JSX.Element => {
  return (
    <main className="min-h-screen w-full bg-white">
      <DashboardShell />
    </main>
  );
};

export default Home;
