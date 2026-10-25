"use client";

import { useTransition } from "react";
import { revokeInvitation } from "../actions";

interface InvitationRevokeButtonProps {
  email: string;
}

export default function InvitationRevokeButton({
  email,
}: InvitationRevokeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRevoke = () => {
    startTransition(async () => {
      await revokeInvitation(email);
    });
  };

  return (
    <button disabled={isPending} onClick={handleRevoke}>
      {isPending ? "Revoking..." : "Revoke"}
    </button>
  );
}
