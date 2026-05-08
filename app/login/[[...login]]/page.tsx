import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LoginContent } from "./login-content";

export default async function LoginPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginContent />
    </div>
  );
}
