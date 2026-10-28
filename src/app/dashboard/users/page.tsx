import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { redirect } from "next/navigation";
import UserSearch from "./_components/search/UserSearch";
import UserRoleSelect from "./_components/UserRoleSelect";
import UserStatusButton from "./_components/UserStatusButton";
import UserDeleteButton from "./_components/UserDeleteButton";
import InviteUserForm from "./_components/InviteUserForm";
import { getUsers } from "@/lib/users/userRepository";
import { getInvitations } from "@/lib/invitations/invitationRepository";

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

  const [users, invitations] = await Promise.all([
    getUsers(queryString, roleType, userStatus),
    getInvitations(),
  ]);

  return (
    <main>
      <h1>Users</h1>
      <InviteUserForm />
      <UserSearch />
      <div>Total invitations: {invitations.length}</div>
      {users.length === 0 ? (
        <div>No users.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th colSpan={2}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "-"}</td>
                <td>{user.email || "-"}</td>
                <td>
                  <UserRoleSelect
                    userId={user.id}
                    role={user.role}
                    disabled={session.user.id === user.id}
                  />
                </td>
                <td>
                  <UserStatusButton
                    userId={user.id}
                    active={user.active}
                    disabled={session.user.id === user.id}
                  />
                </td>
                <td>
                  <UserDeleteButton
                    userId={user.id}
                    disbaled={session.user.id === user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
