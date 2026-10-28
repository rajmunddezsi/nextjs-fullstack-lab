import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { redirect } from "next/navigation";
import UserRestoreButton from "../_components/UserRestoreButton";
import getDeletedUsers from "@/lib/users/userRepository";

export default async function ArchivedUsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const users = await getDeletedUsers();

  return (
    <main>
      <h1>Archived users</h1>
      {users.length === 0 ? (
        <div>No users.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th colSpan={2}>Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "-"}</td>
                <td>{user.email || "-"}</td>
                <td>{user.role}</td>
                <td>{user.deletedAt?.toDateString()}</td>
                <td>
                  <UserRestoreButton userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
