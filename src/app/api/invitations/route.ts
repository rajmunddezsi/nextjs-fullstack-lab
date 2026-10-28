import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { createOrRenewInvitation } from "@/lib/invitations/invitationService";
import z from "zod";

const createInvitationSchema = z.object({
  email: z.email().trim(),
  role: z.enum(Role),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return Response.json({ error: "Forbidden!" }, { status: 403 });
  }

  const body = await request.json();

  const validatedFields = createInvitationSchema.safeParse(body);

  if (!validatedFields.success) {
    return Response.json(
      {
        error: "Invalid fields!",
        details: z.flattenError(validatedFields.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, role } = validatedFields.data;

  const result = await createOrRenewInvitation(email, role, session.user.id);

  return Response.json(
    {
      message: result.message,
    },
    { status: result.success ? 201 : 409 },
  );
}
