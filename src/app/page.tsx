import { signOut } from "@/auth";

export default function Home() {
  const signOutAction = async () => {
    "use server";

    await signOut({ redirectTo: "/login" });
  };

  return (
    <main>
      <h1>Main page</h1>
      <form action={signOutAction}>
        <button type="submit">Sign out</button>
      </form>
    </main>
  );
}
