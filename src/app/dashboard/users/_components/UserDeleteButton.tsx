"use client";

import { useTransition } from "react";
import { softDeleteUser } from "../actions";

interface UserDeleteButtonProps {
  userId: string;
  disbaled?: boolean;
}

export default function UserDeleteButton({
  userId,
  disbaled = false,
}: UserDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleUserDelete = (id: string) => {
    startTransition(async () => {
      try {
        await softDeleteUser(id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <button
      disabled={isPending || disbaled}
      onClick={() => handleUserDelete(userId)}
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
