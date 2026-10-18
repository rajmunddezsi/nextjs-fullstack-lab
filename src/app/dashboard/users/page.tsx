import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { getUsers } from "@/lib/users/getUsers";
import { redirect } from "next/navigation";
import UserSearch from "./_components/search/UserSearch";

interface UsersPageProps {
  searchParams: Promise<{
    query?: string | string[];
    role?: string | string[];
    status?: string | string[];
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const { query, role, status } = await searchParams;
  const queryString = Array.isArray(query) ? query[0] : query;
  const roleString = (
    Array.isArray(role) ? role[0] : role
  ) as keyof typeof Role;
  const roleType = [Role.ADMIN, Role.USER].includes(roleString)
    ? roleString
    : "";

  const statusString = Array.isArray(status) ? status[0] : status;

  let userStatus: boolean | undefined;

  if (statusString === "active") {
    userStatus = true;
  }

  if (statusString === "inactive") {
    userStatus = false;
  }

  const users = await getUsers(queryString, roleType, userStatus);

  return (
    <main>
      <h1>Users</h1>
      <UserSearch />
      {users.length === 0 ? (
        <div>No users.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "-"}</td>
                <td>{user.email || "-"}</td>
                <td>{user.role}</td>
                <td>{user.active ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
