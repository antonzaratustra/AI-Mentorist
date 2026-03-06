"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export default function GoogleAuthButton({
  next = "/welcome",
  label = "Войти через Google",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setErrorText("Сначала добавь переменные Supabase в .env.local, затем перезапусти dev-сервер.");
      return;
    }

    setErrorText("");
    setIsSubmitting(true);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setErrorText(error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`auth-button-group ${className}`.trim()}>
      <button
        className={`button ${variant === "ghost" ? "button--ghost" : "button--primary"}`}
        disabled={disabled || isSubmitting}
        onClick={handleSignIn}
        type="button"
      >
        <span className="google-mark" aria-hidden="true">
          G
        </span>
        {disabled ? "Сначала настрой Supabase" : isSubmitting ? "Открываем Google…" : label}
      </button>
      {errorText ? <p className="form-error">{errorText}</p> : null}
    </div>
  );
}
