import { signIn } from "@/auth";

export default function LoginPage() {
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
    </main>
  );
}
