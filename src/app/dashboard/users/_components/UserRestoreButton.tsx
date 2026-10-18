"use client";

import { useTransition } from "react";
import { restoreUser } from "../actions";

interface UserRestoreButtonProps {
  userId: string;
}

export default function UserRestoreButton({ userId }: UserRestoreButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleUserRestore = (id: string) => {
    startTransition(async () => {
      try {
        await restoreUser(id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <button disabled={isPending} onClick={() => handleUserRestore(userId)}>
      {isPending ? "Restoring..." : "Restore"}
    </button>
  );
}
