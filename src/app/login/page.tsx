import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  if (session) {
    redirect("/dashboard");
  }

  const googleLoginAction = async () => {
    "use server";

    await signIn("google", { redirectTo: "/dashboard" });
  };

  const githubLoginAction = async () => {
    "use server";

    await signIn("github", { redirectTo: "/dashboard" });
  };

  return (
    <main>
      <h1>Sign in</h1>

      <form action={googleLoginAction}>
        <button type="submit">Login with Google</button>
      </form>

      <form action={githubLoginAction}>
        <button type="submit">Login with Github</button>
      </form>

      {error === "inactive" && (
        <div>
          Your account has been deactivated. Please contact an administrator.
        </div>
      )}
    </main>
  );
}
