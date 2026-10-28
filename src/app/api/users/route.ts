import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { getUsers } from "@/lib/users/userRepository";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.ADMIN) {
    return Response.json({ error: "Forbidden!" }, { status: 403 });
  }

  const params = request.nextUrl.searchParams;
  const query = params.get("query") || "";
  const roleParam = params.get("role") || "";
  const statusParam = params.get("status") || "";

  const role = [Role.ADMIN, Role.USER].includes(roleParam as Role) ? roleParam as Role : "";
  const status = statusParam === 'active' ? true : statusParam === 'inactive' ? false : undefined;
  const users = await getUsers(query, role, status);

  return Response.json(users);
}
