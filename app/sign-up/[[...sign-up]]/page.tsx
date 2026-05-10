import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpContent } from "./sign-up-content";

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUpContent />
    </div>
  );
}
