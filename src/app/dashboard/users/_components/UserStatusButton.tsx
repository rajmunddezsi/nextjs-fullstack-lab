"use client";

import { useOptimistic, useTransition } from "react";
import { updateUserStatus } from "../actions";

interface UserStatusButtonProps {
  userId: string;
  active: boolean;
  disabled?: boolean;
}

export default function UserStatusButton({
  userId,
  active,
  disabled = false,
}: UserStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticActive, setOptimisticActive] = useOptimistic(active);
  const buttonLabel = optimisticActive ? "Deactivate" : "Activate";
  const isDisabled = disabled || isPending;

  const handleStatusChange = () => {
    const nextValue = !optimisticActive;

    startTransition(async () => {
      try {
        setOptimisticActive(nextValue);
        await updateUserStatus(userId, nextValue);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <button disabled={isDisabled} onClick={handleStatusChange}>
      {buttonLabel}
    </button>
  );
}
