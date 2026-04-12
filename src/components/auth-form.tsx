"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { getErrorMessage } from "../services/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/shop";
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      if (mode === "register") {
        await register(username.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }

      router.replace(next);
    } catch (submitError) {
      const message = getErrorMessage(submitError);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md border border-zinc-800 bg-night p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className={`text-xs uppercase tracking-[0.2em] ${mode === "login" ? "text-white" : "text-zinc-500"}`}
          onClick={() => router.push(`/login?next=${encodeURIComponent(next)}`)}
        >
          Login
        </button>
        <button
          type="button"
          className={`text-xs uppercase tracking-[0.2em] ${mode === "register" ? "text-white" : "text-zinc-500"}`}
          onClick={() => router.push(`/register?next=${encodeURIComponent(next)}`)}
        >
          Register
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {mode === "register" ? (
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
            placeholder="Username"
          />
        ) : null}
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
          placeholder="Email"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm"
          placeholder="Password"
        />

        {error ? <p className="text-xs uppercase tracking-[0.16em] text-accent">{error}</p> : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full border border-accent bg-accent px-5 py-3 font-body text-[11px] tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs sm:tracking-[0.24em]"
        >
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}