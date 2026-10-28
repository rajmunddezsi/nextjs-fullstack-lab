import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import {
  getUserById,
  softDeleteUserRecord,
  updateUserRoleRecord,
} from "@/lib/users/userRepository";
import z from "zod";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return Response.json({ error: "Forbidden!" }, { status: 403 });
  }

  const { id } = await params;

  const user = await getUserById(id);

  if (!user) {
    return Response.json({ error: "Not found!" }, { status: 404 });
  }

  return Response.json(user);
}

const updateUserSchema = z.object({
  role: z.enum(Role),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return Response.json({ error: "Forbidden!" }, { status: 403 });
  }

  const body = await request.json();

  const validatedFields = updateUserSchema.safeParse(body);

  if (!validatedFields.success) {
    return Response.json(
      {
        error: "Invalid field(s)!",
        details: z.flattenError(validatedFields.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { id } = await params;

  if (session.user.id === id) {
    return Response.json(
      { error: "You cannot update your own role" },
      { status: 409 },
    );
  }

  const existingUser = await getUserById(id);

  if (!existingUser) {
    return Response.json({ error: "User not found!" }, { status: 404 });
  }

  const { role } = validatedFields.data;

  const updatedUser = await updateUserRoleRecord(id, role);

  return Response.json(updatedUser);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return Response.json({ error: "Forbidden!" }, { status: 403 });
  }

  const { id } = await params;

  if (session.user.id === id) {
    return Response.json(
      {
        error: "You cannot delete your own account!",
      },
      { status: 409 },
    );
  }

  const existingUser = await getUserById(id);

  if (!existingUser) {
    return Response.json(
      {
        error: "User not found!",
      },
      { status: 404 },
    );
  }

  await softDeleteUserRecord(id);

  return Response.json({
    message: "User has been deleted successfully!",
  });
}
