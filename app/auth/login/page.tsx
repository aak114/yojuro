"use client";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function Login() {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login to Yojuro</h1>
      <Button className="mt-4" onClick={handleLogin}>
        Sign in with Google
      </Button>
    </div>
  );
}
