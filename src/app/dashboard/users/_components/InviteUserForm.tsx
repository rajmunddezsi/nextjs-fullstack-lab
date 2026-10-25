"use client";

import { Role } from "@/generated/prisma/enums";
import { useActionState } from "react";
import { createInvitation } from "../actions";
import type { InvitationFormState } from "@/lib/users/types";

const INITIAL_STATE: InvitationFormState = {
  success: false,
  message: "",
};

export default function InviteUserForm() {
  const [state, formAction, isPending] = useActionState(
    createInvitation,
    INITIAL_STATE,
  );

  return (
    <div>
      <form action={formAction}>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
          {state?.errors?.email && <div>{state.errors.email[0]}</div>}
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select name="role" id="role">
            <option value={Role.USER}>{Role.USER}</option>
            <option value={Role.ADMIN}>{Role.ADMIN}</option>
          </select>
          {state?.errors?.role && <div>{state.errors.role[0]}</div>}
        </div>

        <button type="submit" disabled={isPending}>
          {isPending ? "Inviting..." : "Invite"}
        </button>
      </form>
      {state.message && !state.success && (
        <div style={{ color: "red" }}>{state.message}</div>
      )}
      {state.message && state.success && (
        <div style={{ color: "green" }}>{state.message}</div>
      )}
    </div>
  );
}
