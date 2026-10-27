import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

const errorMessages: Record<string, string> = {
  inactive: "Your account has been deactivated.",
  "no-invitation": "You don't have an invitation to this application.",
  "invitation-expired": "Your invitation has expired.",
  "invitation-invalid": "Your invitation is no longer valid.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const errorMessage = error ? errorMessages[error] : undefined;

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
        <button type="submit">Login with GitHub</button>
      </form>

      {errorMessage && <div>{errorMessage}</div>}
    </main>
  );
}
