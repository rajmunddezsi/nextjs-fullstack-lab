import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Users</h1>
      <p>Admins only!</p>
    </main>
  );
}
