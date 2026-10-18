"use client";

import { Role, type Role as RoleType } from "@/generated/prisma/enums";
import { useOptimistic, useTransition } from "react";
import { updateUserRole } from "../actions";

interface UserRoleSelectProps {
  userId: string;
  role: RoleType;
  disabled?: boolean;
}

export default function UserRoleSelect({
  userId,
  role,
  disabled = false,
}: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticRole, setOptimisticRole] = useOptimistic(role);
  const selectIsDisabled = disabled || isPending;
  const selectId = `role-${userId}`;

  const handleRoleChange = (newRole: RoleType) => {
    startTransition(async () => {
      try {
        setOptimisticRole(newRole);
        await updateUserRole(userId, newRole);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div>
      <label htmlFor={selectId}>Role change</label>
      <select
        disabled={selectIsDisabled}
        name={selectId}
        id={selectId}
        value={optimisticRole}
        onChange={(e) => handleRoleChange(e.target.value as RoleType)}
      >
        <option value={Role.ADMIN}>{Role.ADMIN}</option>
        <option value={Role.USER}>{Role.USER}</option>
      </select>
    </div>
  );
}
