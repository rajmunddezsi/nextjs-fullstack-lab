import { auth } from "@/auth";
import {
  InvitationStatus,
  Role,
} from "@/generated/prisma/enums";
import { getInvitations } from "@/lib/invitations/invitationRepository";
import { redirect } from "next/navigation";
import InvitationRevokeButton from "../_components/InvitationRevokeButton";

function isExpired(status: InvitationStatus, expiresAt: Date): boolean {
  return status === InvitationStatus.PENDING && expiresAt <= new Date();
}

export default async function InvitationsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const invitations = await getInvitations();

  return (
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Expires</th>
          <th>Invited by</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {invitations.map((invitation) => (
          <tr key={invitation.email}>
            <td>{invitation.email}</td>
            <td>{invitation.role}</td>
            <td>
              {isExpired(invitation.status, invitation.expiresAt)
                ? "EXPIRED"
                : invitation.status}
            </td>
            <td>{String(invitation.expiresAt)}</td>
            <td>
              {invitation.invitedBy.name ?? invitation.invitedBy.email ?? "-"}
            </td>
            <td>
              {!isExpired(invitation.status, invitation.expiresAt) &&
              invitation.status === InvitationStatus.PENDING ? (
                <InvitationRevokeButton email={invitation.email} />
              ) : (
                "-"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
