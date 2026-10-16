import { auth } from "@/auth";
import PageTitle from "@/components/ui/PageTitle";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main>
      <PageTitle title="Dashboard" />
      Welcome, {session?.user?.name ?? "?"}! Your email is:{" "}
      {session?.user?.email ?? "?"}
      You are a(n) {session?.user.role}
    </main>
  );
}
