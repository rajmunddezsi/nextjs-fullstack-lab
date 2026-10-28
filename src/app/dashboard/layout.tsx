import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <ProtectedDashboard>{children}</ProtectedDashboard>
    </Suspense>
  );
}

async function ProtectedDashboard({ children }: DashboardLayoutProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <div>{children}</div>;
}
